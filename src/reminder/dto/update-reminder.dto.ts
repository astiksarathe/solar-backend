import { PartialType } from '@nestjs/mapped-types';
import { CreateReminderDto } from './create-reminder.dto';
import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
} from 'class-validator';

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @IsOptional()
  @IsString()
  completionNotes?: string;
}

// ✅ Mark reminder completed
export class CompleteReminderDto {
  @IsOptional()
  @IsString()
  outcome?: string;

  @IsOptional()
  @IsString()
  completionNotes?: string;

  @IsOptional()
  @IsNumber()
  actualDuration?: number;

  @IsOptional()
  @IsNumber()
  qualityRating?: number;

  @IsOptional()
  @IsString()
  completedBy?: string;
}

// ✅ Add communication record
export class AddCommunicationDto {
  @IsString()
  type: string; // e.g. 'call', 'email', 'meeting'

  @IsString()
  notes: string;

  @IsOptional()
  @IsArray()
  attachments?: string[];
}

// ✅ Add document
export class AddDocumentDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;
}

// ✅ Customer feedback
export class CustomerFeedbackDto {
  @IsOptional()
  @IsString()
  rating?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  collectedBy?: string;
  @IsString()
  feedbackBy: string;
}

// ✅ Reschedule reminder
export class RescheduleReminderDto {
  @IsDateString()
  newScheduledAt: string;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  rescheduledBy?: string;
}
