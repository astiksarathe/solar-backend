import { PartialType } from '@nestjs/mapped-types';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { CreateReminderDto } from './create-reminder.dto';

// Communication History DTOs for updates
export class AddCommunicationDto {
  @IsEnum(['call', 'email', 'whatsapp', 'sms', 'meeting', 'visit'])
  type: string;

  @IsEnum(['inbound', 'outbound'])
  direction: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  summary?: string;

  @IsOptional()
  @IsEnum([
    'successful',
    'no_answer',
    'busy',
    'disconnected',
    'rescheduled',
    'interested',
    'not_interested',
  ])
  outcome?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  recordedBy?: string;
}

export class CompleteReminderDto {
  @IsEnum([
    'successful',
    'partial',
    'failed',
    'no_response',
    'rescheduled',
    'cancelled',
    'no_show',
  ])
  outcome: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  completionNotes?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  actualDuration?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  qualityRating?: number;

  @IsOptional()
  @IsString()
  completedBy?: string;
}

export class RescheduleReminderDto {
  @IsDateString()
  newScheduledAt: string;

  @IsString()
  @MaxLength(500)
  reason: string;

  @IsString()
  rescheduledBy: string;
}

export class AddDocumentDto {
  @IsString()
  @MaxLength(100)
  name: string;

  @IsEnum([
    'contract',
    'id_proof',
    'address_proof',
    'bank_details',
    'quotation',
    'survey_report',
    'installation_plan',
    'compliance_certificate',
    'other',
  ])
  type: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  size?: number;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;

  @IsString()
  uploadedBy: string;
}

export class CustomerFeedbackDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  comments?: string;

  @IsOptional()
  @IsString()
  followUpWanted?: boolean;

  @IsOptional()
  @IsString()
  recommendToOthers?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  areas_for_improvement?: string[];

  @IsString()
  collectedBy: string;
}

export class WeatherInfoDto {
  @IsString()
  condition: string;

  @IsOptional()
  @IsNumber()
  temperature?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  windSpeed?: number;

  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;

  @IsOptional()
  @IsEnum(['manual', 'api'])
  source?: string = 'manual';
}

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class BulkUpdateReminderDto {
  @IsArray()
  @IsString({ each: true })
  reminderIds: string[];

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

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
  @IsString()
  department?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  updatedBy: string;
}

// Specialized DTOs for specific operations
export class SnoozeReminderDto {
  @IsNumber()
  @Min(15)
  @Max(10080) // Max 1 week in minutes
  snoozeMinutes: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  reason?: string;

  @IsString()
  snoozedBy: string;
}

export class DuplicateReminderDto {
  @IsOptional()
  @IsDateString()
  newScheduledAt?: string;

  @IsOptional()
  @IsString()
  newAssignedTo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  newTitle?: string;

  @IsString()
  createdBy: string;
}
