import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  ValidateNested,
  IsMongoId,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==========================
// 🔹 SUB-DTOS
// ==========================

export class LocationDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  pincode?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsArray()
  coordinates?: number[];
}

export class CommunicationEntryDto {
  @IsEnum(['call', 'whatsapp', 'sms', 'email', 'in_person', 'other'])
  type: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  by?: string;

  @IsOptional()
  @IsDateString()
  timestamp?: string;

  @IsOptional()
  @IsString()
  outcome?: string;
}

export class RecurringPatternDto {
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'custom'])
  type?: string;

  @IsOptional()
  @IsArray()
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  repeatInterval?: number;

  @IsOptional()
  @IsNumber()
  maxOccurrences?: number;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class ReminderCostDto {
  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  actualCost?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  totalCost?: number;
}

export class NotificationHistoryDto {
  @IsEnum(['sms', 'email', 'push', 'whatsapp', 'in_app'])
  channel: string;

  @IsOptional()
  @IsDateString()
  sentAt?: string;

  @IsOptional()
  @IsEnum(['sent', 'failed', 'queued'])
  status?: string;

  @IsOptional()
  @IsString()
  messageId?: string;

  @IsOptional()
  @IsString()
  errorMessage?: string;
}

export class FeedbackDto {
  @IsOptional()
  @IsMongoId()
  feedbackBy?: string;

  @IsOptional()
  @IsNumber()
  rating?: number;

  @IsOptional()
  @IsString()
  comments?: string;
}

// ==========================
// 🔸 MAIN DTO
// ==========================

export class CreateReminderDto {
  // --- Basic Info ---
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  entityId: string;

  @IsEnum(['SolarProject', 'Lead', 'Customer', 'User', 'Task'])
  entityModel: string;

  // --- Reminder Type & Status ---
  @IsOptional()
  @IsEnum([
    'follow_up',
    'installation',
    'payment',
    'loan',
    'net_metering',
    'subsidy',
    'maintenance',
    'other',
  ])
  type?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'overdue', 'cancelled', 'rescheduled'])
  status?: string;

  // --- Assigned User ---
  @IsMongoId()
  assignedTo: string;

  @IsOptional()
  @IsMongoId()
  createdBy?: string;

  // --- Timing ---
  @IsDateString()
  scheduledAt: string;

  @IsOptional()
  @IsDateString()
  completedAt?: string;

  @IsOptional()
  @IsDateString()
  rescheduledAt?: string;

  @IsOptional()
  @IsNumber()
  rescheduleCount?: number;

  // --- Location ---
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  // --- Communication History ---
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CommunicationEntryDto)
  communicationHistory?: CommunicationEntryDto[];

  // --- Recurring Pattern ---
  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringPatternDto)
  recurringPattern?: RecurringPatternDto;

  // --- Cost Details ---
  @IsOptional()
  @ValidateNested()
  @Type(() => ReminderCostDto)
  cost?: ReminderCostDto;

  // --- Custom Tags ---
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // --- Documents & Remarks ---
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  remarks?: string;

  // --- Notification History ---
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => NotificationHistoryDto)
  notificationHistory?: NotificationHistoryDto[];

  // --- Weather / External Info ---
  @IsOptional()
  weatherInfo?: Record<string, any>;

  // --- Feedback ---
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FeedbackDto)
  feedback?: FeedbackDto[];

  // --- Audit & Custom Fields ---
  @IsOptional()
  @IsDateString()
  lastModified?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  customFields?: Record<string, any>;
}
