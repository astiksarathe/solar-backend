import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuditService } from '../audit.service';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const handler = context.getHandler();
    const controller = context.getClass();

    // Check if audit is enabled for this endpoint
    const auditMetadata = this.reflector.getAllAndOverride<any>('audit', [
      handler,
      controller,
    ]);

    // Skip if audit is explicitly disabled
    if (auditMetadata === false) {
      return next.handle();
    }

    const startTime = Date.now();
    const user = request.user;
    const entityType =
      auditMetadata?.entityType || this.extractEntityType(request);
    const entityId = auditMetadata?.entityId || this.extractEntityId(request);
    const operation = this.mapHttpMethodToOperation(request.method);
    const module = auditMetadata?.module || this.extractModule(request);

    // Skip audit for certain paths
    if (this.shouldSkipAudit(request.originalUrl)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        const executionTime = Date.now() - startTime;

        // Only audit if we have essential information
        if (entityType) {
          void this.logSuccessfulOperation(
            request,
            response,
            user,
            entityType,
            entityId,
            operation,
            module,
            executionTime,
            data,
            auditMetadata,
          );
        }
      }),
      catchError((error) => {
        const executionTime = Date.now() - startTime;

        if (entityType) {
          void this.logFailedOperation(
            request,
            user,
            entityType,
            entityId,
            operation,
            module,
            executionTime,
            error,
            auditMetadata,
          );
        }

        throw error;
      }),
    );
  }

  private async logSuccessfulOperation(
    request: any,
    response: any,
    user: any,
    entityType: string,
    entityId: string,
    operation: string,
    module: string,
    executionTime: number,
    responseData: any,
    metadata?: any,
  ): Promise<void> {
    try {
      const action = this.generateActionDescription(
        operation,
        entityType,
        request,
      );

      // Handle cases where user is not available (e.g., public endpoints)
      const userId = user?.id || user?._id || 'anonymous';
      const username = user?.username || user?.email || 'anonymous';
      const userEmail = user?.email || null;
      const userRole = user?.role || 'anonymous';

      await this.auditService.logAudit({
        entityId: entityId || 'unknown',
        entityType,
        operation,
        action,
        userId,
        username,
        userEmail,
        userRole,
        ipAddress: request.ip,
        userAgent: request.get('user-agent'),
        requestId: request.headers['x-request-id'],
        sessionId: request.headers['x-session-id'],
        endpoint: request.originalUrl,
        httpMethod: request.method,
        module,
        priority: metadata?.priority || this.determinePriority(operation),
        category: metadata?.category || 'DATA_CHANGE',
        executionTime,
        isSuccessful: true,
        newValues: this.extractRelevantData(responseData, operation),
        metadata: {
          statusCode: response.statusCode,
          responseSize: JSON.stringify(responseData).length,
          ...metadata?.additionalMetadata,
        },
      });
    } catch (error) {
      this.logger.error('Failed to log successful audit event', error);
    }
  }

  private async logFailedOperation(
    request: any,
    user: any,
    entityType: string,
    entityId: string,
    operation: string,
    module: string,
    executionTime: number,
    error: any,
    metadata?: any,
  ): Promise<void> {
    try {
      const action = this.generateActionDescription(
        operation,
        entityType,
        request,
      );

      // Handle cases where user is not available (e.g., public endpoints)
      const userId = user?.id || user?._id || 'anonymous';
      const username = user?.username || user?.email || 'anonymous';
      const userEmail = user?.email || null;
      const userRole = user?.role || 'anonymous';

      await this.auditService.logAudit({
        entityId: entityId || 'unknown',
        entityType,
        operation,
        action,
        userId,
        username,
        userEmail,
        userRole,
        ipAddress: request.ip,
        userAgent: request.get('user-agent'),
        requestId: request.headers['x-request-id'],
        sessionId: request.headers['x-session-id'],
        endpoint: request.originalUrl,
        httpMethod: request.method,
        module,
        priority: 'HIGH',
        category: 'ERROR',
        executionTime,
        isSuccessful: false,
        errorMessage: error.message,
        metadata: {
          errorStack: error.stack,
          statusCode: error.status || 500,
          ...metadata?.additionalMetadata,
        },
      });
    } catch (auditError) {
      this.logger.error('Failed to log failed audit event', auditError);
    }
  }

  private extractEntityType(request: any): string {
    const url = request.originalUrl;

    if (url.includes('/consumer-data')) return 'ConsumerData';
    if (url.includes('/orders')) return 'Order';
    if (url.includes('/leads')) return 'Lead';
    if (url.includes('/reminders')) return 'Reminder';
    if (url.includes('/users')) return 'User';
    if (url.includes('/audit')) return 'AuditLog';

    return 'Unknown';
  }

  private extractEntityId(request: any): string {
    // Try to extract ID from URL params
    if (request.params?.id) return request.params.id;

    // Try to extract from body for create operations
    if (request.body?.id) return request.body.id;
    if (request.body?._id) return request.body._id;

    // Generate a temporary ID for bulk operations
    if (request.method === 'POST' && request.originalUrl.includes('bulk')) {
      return `bulk_${Date.now()}`;
    }

    return 'unknown';
  }

  private extractModule(request: any): string {
    const url = request.originalUrl;

    if (url.includes('/consumer-data')) return 'CONSUMER_DATA';
    if (url.includes('/orders')) return 'ORDERS';
    if (url.includes('/leads')) return 'LEADS';
    if (url.includes('/reminders')) return 'REMINDERS';
    if (url.includes('/users')) return 'USERS';
    if (url.includes('/audit')) return 'AUDIT';
    if (url.includes('/auth')) return 'AUTH';

    return 'SYSTEM';
  }

  private mapHttpMethodToOperation(method: string): string {
    switch (method.toUpperCase()) {
      case 'POST':
        return 'CREATE';
      case 'PUT':
      case 'PATCH':
        return 'UPDATE';
      case 'DELETE':
        return 'DELETE';
      case 'GET':
        return 'READ';
      default:
        return 'CUSTOM';
    }
  }

  private generateActionDescription(
    operation: string,
    entityType: string,
    request: any,
  ): string {
    const entityName = entityType.toLowerCase();
    const url = request.originalUrl;

    if (url.includes('/bulk')) {
      return `Bulk ${operation.toLowerCase()} ${entityName} records`;
    }

    if (url.includes('/complete')) {
      return `Completed ${entityName}`;
    }

    if (url.includes('/reschedule')) {
      return `Rescheduled ${entityName}`;
    }

    if (url.includes('/archive')) {
      return `Archived ${entityName}`;
    }

    switch (operation) {
      case 'CREATE':
        return `Created new ${entityName}`;
      case 'UPDATE':
        return `Updated ${entityName}`;
      case 'DELETE':
        return `Deleted ${entityName}`;
      case 'READ':
        return `Viewed ${entityName}`;
      default:
        return `Performed ${operation.toLowerCase()} on ${entityName}`;
    }
  }

  private determinePriority(operation: string): string {
    switch (operation) {
      case 'DELETE':
        return 'HIGH';
      case 'CREATE':
      case 'UPDATE':
        return 'MEDIUM';
      case 'READ':
        return 'LOW';
      default:
        return 'MEDIUM';
    }
  }

  private extractRelevantData(data: any, operation: string): any {
    if (!data) return null;

    // For create operations, include the created data
    if (operation === 'CREATE') {
      return this.sanitizeData(data);
    }

    // For update operations, try to extract the updated fields
    if (operation === 'UPDATE') {
      return this.sanitizeData(data);
    }

    // For read operations, don't store the data (privacy)
    if (operation === 'READ') {
      return null;
    }

    return null;
  }

  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = [
      'password',
      'token',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
    ];

    const sanitized = { ...data };

    // Remove sensitive fields
    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });

    // Limit data size (prevent huge audit logs)
    const stringified = JSON.stringify(sanitized);
    if (stringified.length > 10000) {
      return { message: 'Data too large to store in audit log' };
    }

    return sanitized;
  }

  private shouldSkipAudit(url: string): boolean {
    const skipPatterns = [
      '/health',
      '/metrics',
      '/favicon.ico',
      '/audit/recent', // Avoid recursive audit logging
      '/audit/stats',
    ];

    return skipPatterns.some((pattern) => url.includes(pattern));
  }
}
