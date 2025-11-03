import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AuditService } from './audit.service';
import { CreateAuditLogDto } from './dto/create-audit-log.dto';
import {
  QueryAuditLogDto,
  AuditLogStatsDto,
  BulkDeleteAuditLogsDto,
} from './dto/query-audit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('Audit System')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post()
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create manual audit log entry',
    description: 'Create a manual audit log entry for custom tracking purposes',
  })
  @ApiResponse({
    status: 201,
    description: 'Audit log created successfully',
    type: CreateAuditLogDto,
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async create(
    @Body() createAuditLogDto: CreateAuditLogDto,
    @GetUser() user: any,
    @Req() request: Request,
  ) {
    // Enrich audit data with request context
    const enrichedAuditData = {
      ...createAuditLogDto,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
      endpoint: request.originalUrl,
      httpMethod: request.method as any,
      requestId: request.headers['x-request-id'] as string,
      sessionId: request.headers['x-session-id'] as string,
    };

    return this.auditService.logAudit(enrichedAuditData);
  }

  @Get()
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({
    summary: 'Get audit logs with filtering',
    description: 'Retrieve audit logs with comprehensive filtering and pagination options',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/AuditLog' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  async findAll(@Query() query: QueryAuditLogDto) {
    return this.auditService.findAll(query);
  }

  @Get('recent')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({
    summary: 'Get recent audit activity',
    description: 'Get the most recent audit activity for dashboard display',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Number of recent activities to return',
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Recent audit activity retrieved successfully',
  })
  async getRecentActivity(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.auditService.getRecentActivity(limit);
  }

  @Get('stats')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({
    summary: 'Get audit statistics and analytics',
    description: 'Get comprehensive audit statistics and analytics data',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        operationStats: { type: 'array' },
        moduleStats: { type: 'array' },
        priorityStats: { type: 'array' },
        categoryStats: { type: 'array' },
        userStats: { type: 'array' },
        timelineStats: { type: 'array' },
        summary: {
          type: 'object',
          properties: {
            totalLogs: { type: 'number' },
            criticalEvents: { type: 'number' },
            securityEvents: { type: 'number' },
            errorEvents: { type: 'number' },
          },
        },
      },
    },
  })
  async getStats(@Query() query: AuditLogStatsDto) {
    return this.auditService.getStats(query);
  }

  @Get('entity/:entityType/:entityId')
  @Roles('admin', 'super_admin', 'manager', 'user')
  @ApiOperation({
    summary: 'Get audit trail for specific entity',
    description: 'Get complete audit trail for a specific entity',
  })
  @ApiParam({
    name: 'entityType',
  description: 'Type of entity (e.g., Order)',
  example: 'Order',
  })
  @ApiParam({
    name: 'entityId',
    description: 'ID of the entity',
    example: '675b8e5a1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Entity audit trail retrieved successfully',
  })
  async getEntityAuditTrail(
    @Param('entityType') entityType: string,
    @Param('entityId') entityId: string,
  ) {
    return this.auditService.findByEntity(entityId, entityType);
  }

  @Get('user/:userId')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({
    summary: 'Get audit logs for specific user',
    description: 'Get audit logs for a specific user with optional limit',
  })
  @ApiParam({
    name: 'userId',
    description: 'ID of the user',
    example: '675b8e5a1234567890abcd01',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Maximum number of logs to return',
    example: 100,
  })
  @ApiResponse({
    status: 200,
    description: 'User audit logs retrieved successfully',
  })
  async getUserAuditLogs(
    @Param('userId') userId: string,
    @Query('limit', new DefaultValuePipe(100), ParseIntPipe) limit: number,
  ) {
    return this.auditService.findByUser(userId, limit);
  }

  @Get(':id')
  @Roles('admin', 'super_admin', 'manager')
  @ApiOperation({
    summary: 'Get audit log by ID',
    description: 'Get a specific audit log entry by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'ID of the audit log',
    example: '675b8e5a1234567890abcdef',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  async findOne(@Param('id') id: string) {
    return this.auditService.findOne(id);
  }

  @Post('archive')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive old audit logs',
    description: 'Archive audit logs older than specified date',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs archived successfully',
    schema: {
      type: 'object',
      properties: {
        archived: { type: 'number' },
        message: { type: 'string' },
      },
    },
  })
  async archiveOldLogs(
    @Body() body: { beforeDate: string },
    @GetUser() user: any,
  ) {
    const archived = await this.auditService.archiveOldLogs(new Date(body.beforeDate));
    
    // Log the archive operation
    await this.auditService.logUserAction(
      `Archived ${archived} audit logs before ${body.beforeDate}`,
      user.id,
      user.username,
      'AUDIT',
      {
        priority: 'MEDIUM',
        category: 'SYSTEM_EVENT',
        metadata: { archivedCount: archived, beforeDate: body.beforeDate },
      },
    );

    return {
      archived,
      message: `Successfully archived ${archived} audit logs`,
    };
  }

  @Delete('bulk')
  @Roles('super_admin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Bulk delete audit logs',
    description: 'Bulk delete audit logs based on criteria (Super Admin only)',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs deleted successfully',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'number' },
        errors: { type: 'array', items: { type: 'string' } },
        message: { type: 'string' },
      },
    },
  })
  async bulkDelete(
    @Body() deleteDto: BulkDeleteAuditLogsDto,
    @GetUser() user: any,
  ) {
    const result = await this.auditService.bulkDelete(deleteDto);
    
    // Log the bulk delete operation
    await this.auditService.logUserAction(
      `Bulk deleted ${result.deleted} audit logs`,
      user.id,
      user.username,
      'AUDIT',
      {
        priority: 'HIGH',
        category: 'SYSTEM_EVENT',
        metadata: { 
          deletedCount: result.deleted, 
          errors: result.errors,
          criteria: deleteDto,
        },
      },
    );

    return {
      ...result,
      message: `Successfully deleted ${result.deleted} audit logs`,
    };
  }

  @Post('security-event')
  @Roles('admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Log a security event',
    description: 'Create a security-related audit log entry',
  })
  @ApiResponse({
    status: 201,
    description: 'Security event logged successfully',
  })
  async logSecurityEvent(
    @Body() body: {
      action: string;
      description?: string;
      metadata?: Record<string, any>;
    },
    @GetUser() user: any,
    @Req() request: Request,
  ) {
    return this.auditService.logSecurityEvent(
      body.action,
      user.id,
      user.username,
      request.ip,
      request.get('user-agent'),
      {
        description: body.description,
        metadata: body.metadata,
        endpoint: request.originalUrl,
        httpMethod: request.method as any,
      },
    );
  }

  @Post('user-action')
  @Roles('admin', 'super_admin', 'manager', 'user')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Log a user action',
    description: 'Create a user action audit log entry',
  })
  @ApiResponse({
    status: 201,
    description: 'User action logged successfully',
  })
  async logUserAction(
    @Body() body: {
      action: string;
      module: string;
      description?: string;
      metadata?: Record<string, any>;
    },
    @GetUser() user: any,
    @Req() request: Request,
  ) {
    return this.auditService.logUserAction(
      body.action,
      user.id,
      user.username,
      body.module,
      {
        description: body.description,
        metadata: body.metadata,
        ipAddress: request.ip,
        userAgent: request.get('user-agent'),
        endpoint: request.originalUrl,
        httpMethod: request.method as any,
      },
    );
  }

  @Get('export/:format')
  @Roles('admin', 'super_admin')
  @ApiOperation({
    summary: 'Export audit logs',
    description: 'Export audit logs in specified format (CSV, JSON, XLSX)',
  })
  @ApiParam({
    name: 'format',
    description: 'Export format',
    enum: ['json', 'csv', 'xlsx'],
    example: 'json',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs exported successfully',
  })
  async exportAuditLogs(
    @Param('format') format: string,
    @Query() query: QueryAuditLogDto,
    @GetUser() user: any,
  ) {
    // Set high limit for export
    const exportQuery = { ...query, limit: 10000 };
    const data = await this.auditService.findAll(exportQuery);
    
    // Log the export operation
    await this.auditService.logUserAction(
      `Exported ${data.total} audit logs in ${format} format`,
      user.id,
      user.username,
      'AUDIT',
      {
        priority: 'MEDIUM',
        category: 'SYSTEM_EVENT',
        metadata: { 
          exportFormat: format, 
          recordCount: data.total,
          exportFilters: query,
        },
      },
    );

    // Return data based on format
    switch (format.toLowerCase()) {
      case 'json':
        return data;
      case 'csv':
        // Here you would implement CSV conversion
        return {
          message: 'CSV export functionality to be implemented',
          data: data.data,
        };
      case 'xlsx':
        // Here you would implement XLSX conversion
        return {
          message: 'XLSX export functionality to be implemented',
          data: data.data,
        };
      default:
        return data;
    }
  }
}