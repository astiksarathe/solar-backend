import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AuditLog } from './entities/audit-log.entity';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import {
  QueryAuditLogDto,
  AuditLogStatsDto,
  BulkDeleteAuditLogsDto,
} from './dto/query-audit-log.dto';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name)
    private auditLogModel: Model<AuditLog>,
  ) {}

  // === CORE AUDIT LOGGING METHODS ===

  /**
   * Log an audit event
   */
  async logAudit(auditData: CreateAuditLogDto): Promise<AuditLog> {
    try {
      const auditLog = new this.auditLogModel({
        ...auditData,
        createdAt: new Date(),
      });

      const savedLog = await auditLog.save();

      // Log critical events to console for immediate attention
      if (auditData.priority === 'CRITICAL' || auditData.category === 'SECURITY') {
        this.logger.warn(
          `CRITICAL AUDIT: ${auditData.action} by ${auditData.username} on ${auditData.entityType}`,
        );
      }

      return savedLog;
    } catch (error) {
      this.logger.error('Failed to save audit log', error);
      throw error;
    }
  }

  /**
   * Log a data change event
   */
  async logDataChange(
    entityId: string,
    entityType: string,
    operation: string,
    userId: string,
    username: string,
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
    options?: Partial<CreateAuditLogDto>,
  ): Promise<AuditLog> {
    const changedFields = this.getChangedFields(oldValues, newValues);
    const delta = this.calculateDelta(oldValues, newValues);

    const auditData: CreateAuditLogDto = {
      entityId,
      entityType,
      operation,
      action: `${operation.toLowerCase()} ${entityType.toLowerCase()}`,
      userId,
      username,
      oldValues,
      newValues,
      changedFields,
      metadata: { delta },
      module: this.mapEntityTypeToModule(entityType),
      category: 'DATA_CHANGE',
      priority: operation === 'DELETE' ? 'HIGH' : 'MEDIUM',
      isSuccessful: true,
      ...options,
    };

    return this.logAudit(auditData);
  }

  /**
   * Log a user action event
   */
  async logUserAction(
    action: string,
    userId: string,
    username: string,
    module: string,
    options?: Partial<CreateAuditLogDto>,
  ): Promise<AuditLog> {
    const auditData: CreateAuditLogDto = {
      entityId: userId,
      entityType: 'User',
      operation: 'CUSTOM',
      action,
      userId,
      username,
      module,
      category: 'USER_ACTION',
      priority: 'LOW',
      isSuccessful: true,
      ...options,
    };

    return this.logAudit(auditData);
  }

  /**
   * Log a security event
   */
  async logSecurityEvent(
    action: string,
    userId: string,
    username: string,
    ipAddress?: string,
    userAgent?: string,
    options?: Partial<CreateAuditLogDto>,
  ): Promise<AuditLog> {
    const auditData: CreateAuditLogDto = {
      entityId: userId,
      entityType: 'Security',
      operation: 'CUSTOM',
      action,
      userId,
      username,
      ipAddress,
      userAgent,
      module: 'AUTH',
      category: 'SECURITY',
      priority: 'HIGH',
      isSuccessful: true,
      ...options,
    };

    return this.logAudit(auditData);
  }

  /**
   * Log a bulk operation
   */
  async logBulkOperation(
    operation: string,
    entityType: string,
    userId: string,
    username: string,
    affectedIds: string[],
    batchId: string,
    options?: Partial<CreateAuditLogDto>,
  ): Promise<AuditLog> {
    const auditData: CreateAuditLogDto = {
      entityId: batchId,
      entityType,
      operation: `BULK_${operation.toUpperCase()}`,
      action: `Bulk ${operation.toLowerCase()} ${affectedIds.length} ${entityType.toLowerCase()} records`,
      userId,
      username,
      batchId,
      metadata: { affectedIds, count: affectedIds.length },
      module: this.mapEntityTypeToModule(entityType),
      category: 'DATA_CHANGE',
      priority: 'MEDIUM',
      isSuccessful: true,
      ...options,
    };

    return this.logAudit(auditData);
  }

  /**
   * Log an error event
   */
  async logError(
    action: string,
    userId: string,
    username: string,
    errorMessage: string,
    errorStack?: string,
    options?: Partial<CreateAuditLogDto>,
  ): Promise<AuditLog> {
    const auditData: CreateAuditLogDto = {
      entityId: 'error',
      entityType: 'System',
      operation: 'CUSTOM',
      action,
      userId,
      username,
      errorMessage,
      module: 'SYSTEM',
      category: 'ERROR',
      priority: 'HIGH',
      isSuccessful: false,
      metadata: { errorStack },
      ...options,
    };

    return this.logAudit(auditData);
  }

  // === QUERY METHODS ===

  /**
   * Get audit logs with filtering and pagination
   */
  async findAll(query: QueryAuditLogDto): Promise<{
    data: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      entityId,
      entityType,
      operation,
      userId,
      username,
      userEmail,
      module,
      subModule,
      priority,
      category,
      tags,
      search,
      fromDate,
      toDate,
      ipAddress,
      httpMethod,
      endpoint,
      batchId,
      requestId,
      sessionId,
      isSuccessful,
      isComplianceRequired,
      isArchived,
      minExecutionTime,
      maxExecutionTime,
      country,
      region,
      city,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      fields,
      excludeFields,
    } = query;

    const filter: Record<string, any> = {};

    // Basic filters
    if (entityId) filter.entityId = entityId;
    if (entityType) filter.entityType = entityType;
    if (userId) filter.userId = userId;
    if (username) filter.username = { $regex: username, $options: 'i' };
    if (userEmail) filter.userEmail = { $regex: userEmail, $options: 'i' };
    if (subModule) filter.subModule = subModule;
    if (ipAddress) filter.ipAddress = ipAddress;
    if (endpoint) filter.endpoint = { $regex: endpoint, $options: 'i' };
    if (batchId) filter.batchId = batchId;
    if (requestId) filter.requestId = requestId;
    if (sessionId) filter.sessionId = sessionId;
    if (country) filter['location.country'] = country;
    if (region) filter['location.region'] = region;
    if (city) filter['location.city'] = city;

    // Multi-value filters
    if (operation) {
      const operations = operation.split(',').map((op) => op.trim());
      filter.operation = { $in: operations };
    }
    if (module) {
      const modules = module.split(',').map((mod) => mod.trim());
      filter.module = { $in: modules };
    }
    if (priority) {
      const priorities = priority.split(',').map((pri) => pri.trim());
      filter.priority = { $in: priorities };
    }
    if (category) {
      const categories = category.split(',').map((cat) => cat.trim());
      filter.category = { $in: categories };
    }
    if (httpMethod) {
      const methods = httpMethod.split(',').map((method) => method.trim());
      filter.httpMethod = { $in: methods };
    }
    if (tags) {
      const tagList = tags.split(',').map((tag) => tag.trim());
      filter.tags = { $in: tagList };
    }

    // Boolean filters
    if (isSuccessful !== undefined) filter.isSuccessful = isSuccessful;
    if (isComplianceRequired !== undefined) filter.isComplianceRequired = isComplianceRequired;
    if (isArchived !== undefined) filter.isArchived = isArchived;

    // Date range filter
    if (fromDate || toDate) {
      filter.createdAt = {};
      if (fromDate) filter.createdAt.$gte = new Date(fromDate);
      if (toDate) filter.createdAt.$lte = new Date(toDate);
    }

    // Execution time range filter
    if (minExecutionTime !== undefined || maxExecutionTime !== undefined) {
      filter.executionTime = {};
      if (minExecutionTime !== undefined) filter.executionTime.$gte = minExecutionTime;
      if (maxExecutionTime !== undefined) filter.executionTime.$lte = maxExecutionTime;
    }

    // Text search
    if (search) {
      filter.$or = [
        { action: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { searchText: { $regex: search, $options: 'i' } },
      ];
    }

    // Build sort options
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Build projection for field selection
    let projection: Record<string, number> | undefined;
    if (fields) {
      projection = {};
      fields.split(',').forEach((field) => {
        projection![field.trim()] = 1;
      });
    } else if (excludeFields) {
      projection = {};
      excludeFields.split(',').forEach((field) => {
        projection![field.trim()] = 0;
      });
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [data, total] = await Promise.all([
      this.auditLogModel
        .find(filter, projection)
        .sort(sortOptions)
        .skip(skip)
        .limit(Number(limit))
        .exec(),
      this.auditLogModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  /**
   * Get audit log by ID
   */
  async findOne(id: string): Promise<AuditLog | null> {
    return this.auditLogModel.findById(id).exec();
  }

  /**
   * Get audit logs for a specific entity
   */
  async findByEntity(entityId: string, entityType: string): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ entityId, entityType })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Get audit logs for a specific user
   */
  async findByUser(userId: string, limit = 100): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  /**
   * Get recent audit activity
   */
  async getRecentActivity(limit = 50): Promise<AuditLog[]> {
    return this.auditLogModel
      .find({ isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .select('entityType operation action username createdAt priority category')
      .exec();
  }

  // === STATISTICS AND ANALYTICS ===

  /**
   * Get audit statistics
   */
  async getStats(query: AuditLogStatsDto): Promise<any> {
    const { fromDate, toDate, module, userId, groupBy = 'day' } = query;

    const matchFilter: Record<string, any> = {};
    if (module) matchFilter.module = module;
    if (userId) matchFilter.userId = userId;
    if (fromDate || toDate) {
      matchFilter.createdAt = {};
      if (fromDate) matchFilter.createdAt.$gte = new Date(fromDate);
      if (toDate) matchFilter.createdAt.$lte = new Date(toDate);
    }

    const [
      operationStats,
      moduleStats,
      priorityStats,
      categoryStats,
      userStats,
      timelineStats,
    ] = await Promise.all([
      // Operation distribution
      this.auditLogModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$operation', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Module distribution
      this.auditLogModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),

      // Priority distribution
      this.auditLogModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$priority', count: { $sum: 1 } } },
      ]),

      // Category distribution
      this.auditLogModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),

      // Top users by activity
      this.auditLogModel.aggregate([
        { $match: matchFilter },
        { $group: { _id: '$username', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // Timeline stats based on groupBy
      this.getTimelineStats(matchFilter, groupBy),
    ]);

    return {
      operationStats,
      moduleStats,
      priorityStats,
      categoryStats,
      userStats,
      timelineStats,
      summary: {
        totalLogs: await this.auditLogModel.countDocuments(matchFilter),
        criticalEvents: await this.auditLogModel.countDocuments({
          ...matchFilter,
          priority: 'CRITICAL',
        }),
        securityEvents: await this.auditLogModel.countDocuments({
          ...matchFilter,
          category: 'SECURITY',
        }),
        errorEvents: await this.auditLogModel.countDocuments({
          ...matchFilter,
          isSuccessful: false,
        }),
      },
    };
  }

  /**
   * Get timeline statistics
   */
  private async getTimelineStats(matchFilter: any, groupBy: string): Promise<any[]> {
    let dateGrouping: any;

    switch (groupBy) {
      case 'hour':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
          hour: { $hour: '$createdAt' },
        };
        break;
      case 'week':
        dateGrouping = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case 'month':
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      default: // day
        dateGrouping = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
    }

    return this.auditLogModel.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: dateGrouping,
          count: { $sum: 1 },
          errors: { $sum: { $cond: [{ $eq: ['$isSuccessful', false] }, 1, 0] } },
          critical: { $sum: { $cond: [{ $eq: ['$priority', 'CRITICAL'] }, 1, 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.hour': 1 } },
    ]);
  }

  // === CLEANUP AND MAINTENANCE ===

  /**
   * Archive old audit logs
   */
  async archiveOldLogs(beforeDate: Date): Promise<number> {
    const result = await this.auditLogModel.updateMany(
      {
        createdAt: { $lt: beforeDate },
        isComplianceRequired: false,
        isArchived: false,
      },
      { isArchived: true },
    );

    this.logger.log(`Archived ${result.modifiedCount} audit logs before ${beforeDate}`);
    return result.modifiedCount;
  }

  /**
   * Delete audit logs (bulk operation)
   */
  async bulkDelete(deleteDto: BulkDeleteAuditLogsDto): Promise<{
    deleted: number;
    errors: string[];
  }> {
    const filter: Record<string, any> = {};
    const errors: string[] = [];

    // Only allow deletion of non-compliance logs by default
    if (deleteDto.onlyNonCompliance !== false) {
      filter.isComplianceRequired = false;
    }

    if (deleteDto.ids && deleteDto.ids.length > 0) {
      filter._id = { $in: deleteDto.ids };
    }

    if (deleteDto.beforeDate) {
      filter.createdAt = { $lt: new Date(deleteDto.beforeDate) };
    }

    if (deleteDto.entityType) {
      filter.entityType = deleteDto.entityType;
    }

    if (deleteDto.module) {
      filter.module = deleteDto.module;
    }

    try {
      const result = await this.auditLogModel.deleteMany(filter);
      this.logger.log(`Bulk deleted ${result.deletedCount} audit logs`);
      
      return {
        deleted: result.deletedCount,
        errors,
      };
    } catch (error) {
      this.logger.error('Bulk delete failed', error);
      errors.push(`Bulk delete failed: ${error}`);
      return {
        deleted: 0,
        errors,
      };
    }
  }

  // === UTILITY METHODS ===

  /**
   * Calculate changed fields between old and new values
   */
  private getChangedFields(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): string[] {
    if (!oldValues || !newValues) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldValues), ...Object.keys(newValues)]);

    allKeys.forEach((key) => {
      if (oldValues[key] !== newValues[key]) {
        changedFields.push(key);
      }
    });

    return changedFields;
  }

  /**
   * Calculate delta between old and new values
   */
  private calculateDelta(
    oldValues?: Record<string, any>,
    newValues?: Record<string, any>,
  ): Record<string, { old: any; new: any }> {
    if (!oldValues || !newValues) return {};

    const delta: Record<string, { old: any; new: any }> = {};
    const changedFields = this.getChangedFields(oldValues, newValues);

    changedFields.forEach((field) => {
      delta[field] = {
        old: oldValues[field],
        new: newValues[field],
      };
    });

    return delta;
  }

  /**
   * Map entity type to module
   */
  private mapEntityTypeToModule(entityType: string): string {
    const mapping: Record<string, string> = {
      ConsumerHistory: 'CONSUMER_HISTORY',
      ConsumerData: 'CONSUMER_DATA',
      Order: 'ORDERS',
      Reminder: 'REMINDERS',
      User: 'USERS',
      AuditLog: 'AUDIT',
    };

    return mapping[entityType] || 'SYSTEM';
  }
}