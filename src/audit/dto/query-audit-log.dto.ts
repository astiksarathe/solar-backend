import {
  IsOptional,
  IsString,
  IsEnum,
  IsArray,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class QueryAuditLogDto {
  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '675b8e5a1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  entityId?: string;

  @ApiPropertyOptional({
    description: 'Filter by entity type',
    example: 'ConsumerHistory',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Filter by operation (comma-separated for multiple)',
    example: 'CREATE,UPDATE,DELETE',
  })
  @IsOptional()
  @IsString()
  operation?: string;

  @ApiPropertyOptional({
    description: 'Filter by user ID',
    example: '675b8e5a1234567890abcd01',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by username',
    example: 'john.doe',
  })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiPropertyOptional({
    description: 'Filter by user email',
    example: 'john.doe@company.com',
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'Filter by module (comma-separated for multiple)',
    example: 'CONSUMER_HISTORY,ORDERS',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Filter by sub-module',
    example: 'interaction_management',
  })
  @IsOptional()
  @IsString()
  subModule?: string;

  @ApiPropertyOptional({
    description: 'Filter by priority (comma-separated for multiple)',
    example: 'HIGH,CRITICAL',
  })
  @IsOptional()
  @IsString()
  priority?: string;

  @ApiPropertyOptional({
    description: 'Filter by category (comma-separated for multiple)',
    example: 'DATA_CHANGE,SECURITY',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    description: 'Filter by tags (comma-separated)',
    example: 'status_change,high_value',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiPropertyOptional({
    description: 'Text search across action, description, and username',
    example: 'updated status',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO format)',
    example: '2024-12-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by IP address',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'Filter by HTTP method (comma-separated for multiple)',
    example: 'POST,PATCH',
  })
  @IsOptional()
  @IsString()
  httpMethod?: string;

  @ApiPropertyOptional({
    description: 'Filter by endpoint pattern',
    example: '/api/consumer-history',
  })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({
    description: 'Filter by batch ID',
    example: 'batch_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Filter by request ID',
    example: 'req_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Filter by session ID',
    example: 'sess_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'Filter by success status',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return Boolean(value);
  })
  isSuccessful?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by compliance requirement',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isComplianceRequired?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by archived status',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  isArchived?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum execution time in milliseconds',
    minimum: 0,
    example: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (Number.isNaN(Number(value)) ? 0 : Number(value)))
  minExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Maximum execution time in milliseconds',
    minimum: 0,
    example: 5000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Transform(({ value }) => (Number.isNaN(Number(value)) ? 0 : Number(value)))
  maxExecutionTime?: number;

  @ApiPropertyOptional({
    description: 'Filter by geographic country',
    example: 'India',
  })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({
    description: 'Filter by geographic region/state',
    example: 'Haryana',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Filter by city',
    example: 'Gurgaon',
  })
  @IsOptional()
  @IsString()
  city?: string;

  // Pagination and Sorting

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    minimum: 1,
    default: 1,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
    example: 20,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    default: 'createdAt',
    example: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // Advanced Filters

  @ApiPropertyOptional({
    description: 'Include specific fields in response (comma-separated)',
    example: 'entityId,operation,userId,createdAt',
  })
  @IsOptional()
  @IsString()
  fields?: string;

  @ApiPropertyOptional({
    description: 'Exclude specific fields from response (comma-separated)',
    example: 'oldValues,newValues,metadata',
  })
  @IsOptional()
  @IsString()
  excludeFields?: string;

  @ApiPropertyOptional({
    description: 'Group results by field',
    example: 'module',
  })
  @IsOptional()
  @IsString()
  groupBy?: string;

  @ApiPropertyOptional({
    description: 'Include aggregate statistics',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  includeStats?: boolean = false;

  @ApiPropertyOptional({
    description: 'Export format for large datasets',
    enum: ['json', 'csv', 'xlsx'],
    example: 'json',
  })
  @IsOptional()
  @IsEnum(['json', 'csv', 'xlsx'])
  exportFormat?: string;
}

export class AuditLogStatsDto {
  @ApiPropertyOptional({
    description: 'Start date for statistics (ISO format)',
    example: '2024-12-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for statistics (ISO format)',
    example: '2024-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter statistics by module',
    example: 'CONSUMER_HISTORY',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Filter statistics by user ID',
    example: '675b8e5a1234567890abcd01',
  })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Group statistics by time period',
    enum: ['hour', 'day', 'week', 'month'],
    default: 'day',
    example: 'day',
  })
  @IsOptional()
  @IsEnum(['hour', 'day', 'week', 'month'])
  groupBy?: string = 'day';
}

export class BulkDeleteAuditLogsDto {
  @ApiPropertyOptional({
    description: 'Array of audit log IDs to delete',
    example: ['675b8e5a1234567890abcdef', '675b8e5a1234567890abcde0'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ids?: string[];

  @ApiPropertyOptional({
    description: 'Delete all logs before this date (ISO format)',
    example: '2024-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  beforeDate?: string;

  @ApiPropertyOptional({
    description: 'Delete logs for specific entity type',
    example: 'ConsumerHistory',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Delete logs for specific module',
    example: 'CONSUMER_HISTORY',
  })
  @IsOptional()
  @IsString()
  module?: string;

  @ApiPropertyOptional({
    description: 'Delete only non-compliance required logs',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  onlyNonCompliance?: boolean = true;
}
