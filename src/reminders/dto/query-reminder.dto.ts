import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsArray,
  IsMongoId,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryReminderDto {
  // === BASIC FILTERS ===
  @IsOptional()
  @IsEnum([
    'call',
    'whatsapp',
    'email',
    'meeting',
    'site_visit',
    'proposal_followup',
    'document_collection',
    'installation_schedule',
    'payment_followup',
    'survey',
    'delivery',
    'maintenance',
    'training',
    'inspection',
    'warranty_check',
    'other',
  ])
  type?: string;

  @IsOptional()
  @IsEnum([
    'pending',
    'completed',
    'cancelled',
    'rescheduled',
    'in_progress',
    'overdue',
    'on_hold',
  ])
  status?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum([
    'sales',
    'technical',
    'installation',
    'admin',
    'management',
    'support',
  ])
  department?: string;

  // === ENTITY FILTERS ===
  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsEnum(['ConsumerData', 'Lead', 'Order'])
  entityModel?: string;

  // For backward compatibility
  @IsOptional()
  @IsString()
  relatedConsumerId?: string;

  @IsOptional()
  @IsString()
  relatedLeadId?: string;

  @IsOptional()
  @IsString()
  relatedOrderId?: string;

  // === DATE FILTERS ===
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsDateString()
  completedFromDate?: string;

  @IsOptional()
  @IsDateString()
  completedToDate?: string;

  @IsOptional()
  @IsDateString()
  createdFromDate?: string;

  @IsOptional()
  @IsDateString()
  createdToDate?: string;

  // === ADVANCED FILTERS ===
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isCritical?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isRecurring?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  weatherDependent?: boolean;

  @IsOptional()
  @IsEnum([
    'successful',
    'partial',
    'failed',
    'no_response',
    'rescheduled',
    'cancelled',
    'no_show',
  ])
  outcome?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  businessImpact?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string; // Comma-separated tags

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  completedBy?: string;

  // === COMMUNICATION FILTERS ===
  @IsOptional()
  @IsEnum(['call', 'email', 'whatsapp', 'sms', 'meeting', 'visit'])
  communicationType?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasDocuments?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  pendingDocuments?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasFollowUpActions?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasTeamMembers?: boolean;

  // === QUALITY FILTERS ===
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  minQualityRating?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  customerRating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasCustomerFeedback?: boolean;

  // === RESCHEDULING FILTERS ===
  @IsOptional()
  @IsNumber()
  @Min(0)
  minRescheduleCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRescheduleCount?: number;

  // === DURATION FILTERS ===
  @IsOptional()
  @IsNumber()
  @Min(0)
  minExpectedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxExpectedDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minActualDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxActualDuration?: number;

  // === OVERDUE FILTERS ===
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  overdue?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  dueToday?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  dueTomorrow?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  dueThisWeek?: boolean;

  // === SEARCH ===
  @IsOptional()
  @IsString()
  search?: string; // Full-text search across title, description, notes

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  // === PAGINATION ===
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  // === SORTING ===
  @IsOptional()
  @IsEnum([
    'scheduledAt',
    'priority',
    'title',
    'status',
    'createdAt',
    'updatedAt',
    'completedAt',
    'type',
    'assignedTo',
    'department',
    'qualityRating',
    'rescheduleCount',
    'expectedDuration',
    'actualDuration',
  ])
  sortBy?: string = 'scheduledAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'asc';

  // === AGGREGATION OPTIONS ===
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeStats?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeCommunicationHistory?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeDocuments?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeFollowUpActions?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeWeatherInfo?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeQualityMetrics?: boolean = false;
}

export class ReminderStatsQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'quarter', 'year'])
  groupBy?: string = 'day';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[]; // ['count', 'completion_rate', 'avg_duration', 'quality_rating']

  @IsOptional()
  @IsArray()
  @IsEnum(['call', 'whatsapp', 'email', 'meeting', 'site_visit', 'other'], {
    each: true,
  })
  types?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(['pending', 'completed', 'cancelled', 'rescheduled', 'overdue'], {
    each: true,
  })
  statuses?: string[];
}

export class ReminderAnalyticsQueryDto {
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly'])
  period?: string = 'daily';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includeMetrics?: string[]; // ['productivity', 'quality', 'communication', 'scheduling']
}

export class UpcomingRemindersQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  days?: number = 7; // Next N days

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  minPriority?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  criticalOnly?: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  weatherDependent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}

export class OverdueRemindersQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(365)
  daysPastDue?: number; // More than N days overdue

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  minPriority?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
