import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryReminderDto {
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
  ])
  status?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  relatedConsumerId?: string;

  @IsOptional()
  @IsString()
  relatedLeadId?: string;

  @IsOptional()
  @IsString()
  relatedOrderId?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsEnum(['scheduledAt', 'priority', 'title', 'status', 'createdAt'])
  sortBy?: string = 'scheduledAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'asc';

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isCritical?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  isRecurring?: boolean;

  @IsOptional()
  @IsString()
  tags?: string;
}

export class ReminderStatsQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;
}