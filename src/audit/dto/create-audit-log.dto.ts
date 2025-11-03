import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsObject,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAuditLogDto {
  @ApiProperty({
    description: 'Unique identifier for the entity being audited',
    example: '675b8e5a1234567890abcdef',
  })
  @IsString()
  entityId: string;

  @ApiProperty({
    description: 'Type/name of the entity being audited',
    example: 'ConsumerHistory',
  })
  @IsString()
  entityType: string;

  @ApiProperty({
    description: 'The operation performed on the entity',
    enum: [
      'CREATE',
      'UPDATE',
      'DELETE',
      'BULK_UPDATE',
      'BULK_DELETE',
      'STATUS_CHANGE',
      'ASSIGNMENT_CHANGE',
      'APPROVAL',
      'REJECTION',
      'COMPLETION',
      'CANCELLATION',
      'ARCHIVE',
      'RESTORE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'IMPORT',
      'CUSTOM',
    ],
    example: 'UPDATE',
  })
  @IsEnum([
    'CREATE',
    'UPDATE',
    'DELETE',
    'BULK_UPDATE',
    'BULK_DELETE',
    'STATUS_CHANGE',
    'ASSIGNMENT_CHANGE',
    'APPROVAL',
    'REJECTION',
    'COMPLETION',
    'CANCELLATION',
    'ARCHIVE',
    'RESTORE',
    'LOGIN',
    'LOGOUT',
    'EXPORT',
    'IMPORT',
    'CUSTOM',
  ])
  operation: string;

  @ApiProperty({
    description: 'Brief description of the action performed',
    example: 'Updated consumer interaction status',
  })
  @IsString()
  action: string;

  @ApiPropertyOptional({
    description: 'Detailed description of what was changed',
    example:
      'Changed status from pending to completed and added completion notes',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'ID of the user who performed the action',
    example: '675b8e5a1234567890abcd01',
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Username of the user who performed the action',
    example: 'john.doe',
  })
  @IsString()
  username: string;

  @ApiPropertyOptional({
    description: 'Email of the user who performed the action',
    example: 'john.doe@company.com',
  })
  @IsOptional()
  @IsString()
  userEmail?: string;

  @ApiPropertyOptional({
    description: 'Role of the user at the time of action',
    example: 'sales_manager',
  })
  @IsOptional()
  @IsString()
  userRole?: string;

  @ApiPropertyOptional({
    description: 'Previous values before the change (for UPDATE operations)',
    example: { status: 'pending', notes: 'Initial inquiry' },
  })
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'New values after the change',
    example: { status: 'completed', notes: 'Customer confirmed installation' },
  })
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'List of specific fields that were changed',
    example: ['status', 'notes', 'completedDate'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  changedFields?: string[];

  @ApiPropertyOptional({
    description: 'IP address from which the action was performed',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @ApiPropertyOptional({
    description: 'User agent string from the request',
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  @IsOptional()
  @IsString()
  userAgent?: string;

  @ApiPropertyOptional({
    description: 'Request ID for tracing',
    example: 'req_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  requestId?: string;

  @ApiPropertyOptional({
    description: 'Session ID for user session tracking',
    example: 'sess_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  sessionId?: string;

  @ApiPropertyOptional({
    description: 'API endpoint that was called',
  })
  @IsOptional()
  @IsString()
  endpoint?: string;

  @ApiPropertyOptional({
    description: 'HTTP method used',
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    example: 'PATCH',
  })
  @IsOptional()
  @IsEnum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
  httpMethod?: string;

  @ApiProperty({
    description: 'Module/feature area where the action occurred',
    enum: [
      'CONSUMER_HISTORY',
      'CONSUMER_DATA',
      'ORDERS',
      'REMINDERS',
      'USERS',
      'AUTH',
      'SYSTEM',
      'REPORTS',
      'SETTINGS',
      'AUDIT',
    ],
    example: 'CONSUMER_HISTORY',
  })
  @IsEnum([
    'CONSUMER_HISTORY',
    'CONSUMER_DATA',
    'ORDERS',
    'REMINDERS',
    'USERS',
    'AUTH',
    'SYSTEM',
    'REPORTS',
    'SETTINGS',
    'AUDIT',
  ])
  module: string;

  @ApiPropertyOptional({
    description: 'Sub-module or specific feature',
    example: 'interaction_management',
  })
  @IsOptional()
  @IsString()
  subModule?: string;

  @ApiPropertyOptional({
    description: 'Business reason for the change',
    example: 'Customer requested status update after site visit',
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Priority level of the audit event',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: string = 'MEDIUM';

  @ApiPropertyOptional({
    description: 'Category of the audit event',
    enum: [
      'DATA_CHANGE',
      'SECURITY',
      'BUSINESS_PROCESS',
      'SYSTEM_EVENT',
      'USER_ACTION',
      'COMPLIANCE',
      'ERROR',
      'PERFORMANCE',
    ],
    default: 'DATA_CHANGE',
    example: 'BUSINESS_PROCESS',
  })
  @IsOptional()
  @IsEnum([
    'DATA_CHANGE',
    'SECURITY',
    'BUSINESS_PROCESS',
    'SYSTEM_EVENT',
    'USER_ACTION',
    'COMPLIANCE',
    'ERROR',
    'PERFORMANCE',
  ])
  category?: string = 'DATA_CHANGE';

  @ApiPropertyOptional({
    description: 'Custom tags for categorization and filtering',
    example: ['status_change', 'customer_interaction', 'high_value'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Additional metadata specific to the entity or operation',
    example: {
      previousInterestLevel: 'interested',
      newInterestLevel: 'ready_to_buy',
    },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Batch ID for bulk operations',
    example: 'batch_1234567890abcdef',
  })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Whether this audit log is required for compliance',
    default: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isComplianceRequired?: boolean = false;

  @ApiPropertyOptional({
    description: 'Retention period in days (0 means permanent)',
    default: 2555,
    minimum: 0,
    example: 2555,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  retentionDays?: number = 2555;

  @ApiPropertyOptional({
    description: 'Time taken to perform the operation (in milliseconds)',
    minimum: 0,
    example: 250,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  executionTime?: number;

  @ApiPropertyOptional({
    description: 'Whether the operation was successful',
    default: true,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isSuccessful?: boolean = true;

  @ApiPropertyOptional({
    description: 'Error message if the operation failed',
    example: 'Failed to update: Entity not found',
  })
  @IsOptional()
  @IsString()
  errorMessage?: string;

  @ApiPropertyOptional({
    description: 'Geographic location where the action was performed',
    example: {
      country: 'India',
      region: 'Haryana',
      city: 'Gurgaon',
      coordinates: { latitude: 28.4595, longitude: 77.0266 },
    },
  })
  @IsOptional()
  @IsObject()
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
}
