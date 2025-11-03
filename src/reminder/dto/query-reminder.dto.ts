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
  IsIn,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

// === ENUMS FOR SAFER VALIDATION ===
export enum ReminderType {
  CALL = 'call',
  WHATSAPP = 'whatsapp',
  EMAIL = 'email',
  MEETING = 'meeting',
  SITE_VISIT = 'site_visit',
  PROPOSAL_FOLLOWUP = 'proposal_followup',
  DOCUMENT_COLLECTION = 'document_collection',
  INSTALLATION_SCHEDULE = 'installation_schedule',
  PAYMENT_FOLLOWUP = 'payment_followup',
  SURVEY = 'survey',
  DELIVERY = 'delivery',
  MAINTENANCE = 'maintenance',
  TRAINING = 'training',
  INSPECTION = 'inspection',
  WARRANTY_CHECK = 'warranty_check',
  OTHER = 'other',
}

export enum ReminderStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled',
  IN_PROGRESS = 'in_progress',
  OVERDUE = 'overdue',
  ON_HOLD = 'on_hold',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum Department {
  SALES = 'sales',
  TECHNICAL = 'technical',
  INSTALLATION = 'installation',
  ADMIN = 'admin',
  MANAGEMENT = 'management',
  SUPPORT = 'support',
}

// === MAIN QUERY DTO ===
export class QueryReminderDto {
  @IsOptional()
  @IsEnum(ReminderType)
  type?: ReminderType;

  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(Department)
  department?: Department;

  @IsOptional()
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsIn(['ConsumerData', 'Order'])
  entityModel?: string;

  @IsOptional()
  @IsString()
  relatedConsumerId?: string;

  @IsOptional()
  @IsString()
  relatedOrderId?: string;

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
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  businessImpact?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsString()
  completedBy?: string;

  @IsOptional()
  @IsIn(['call', 'email', 'whatsapp', 'sms', 'meeting', 'visit'])
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

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  minQualityRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(5)
  customerRating?: number;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  hasCustomerFeedback?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRescheduleCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRescheduleCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minExpectedDuration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxExpectedDuration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minActualDuration?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxActualDuration?: number;

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

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @IsIn([
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
  sortBy: string = 'scheduledAt';

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: string = 'asc';

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeStats: boolean = false;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeCommunicationHistory?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeDocuments?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeFollowUpActions?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeWeatherInfo?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  includeQualityMetrics?: boolean;
}

// === REMINDER STATS DTO ===
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
  @IsIn(['day', 'week', 'month', 'quarter', 'year'])
  groupBy: string = 'day';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  metrics?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReminderType, { each: true })
  types?: ReminderType[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReminderStatus, { each: true })
  statuses?: ReminderStatus[];
}

// === UPCOMING REMINDERS DTO ===
export class UpcomingRemindersQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(30)
  days: number = 7;

  @IsOptional()
  @IsEnum(Priority)
  minPriority?: Priority;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  criticalOnly?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  weatherDependent?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 50;
}

// === OVERDUE REMINDERS DTO ===
export class OverdueRemindersQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(365)
  daysPastDue?: number;

  @IsOptional()
  @IsEnum(Priority)
  minPriority?: Priority;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit: number = 50;
}
