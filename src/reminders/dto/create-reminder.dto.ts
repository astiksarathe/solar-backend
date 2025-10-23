import {
  IsString,
  IsEnum,
  IsOptional,
  IsDateString,
  IsNumber,
  IsArray,
  IsObject,
  IsMongoId,
  IsBoolean,
} from 'class-validator';

export class CreateReminderDto {
  @IsEnum([
    'follow_up_call',
    'site_visit',
    'proposal_review',
    'payment_reminder',
    'installation_schedule',
    'maintenance_check',
    'document_submission',
    'general',
  ])
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  reminderDate: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string = 'medium';

  @IsEnum(['pending', 'completed', 'cancelled', 'snoozed'])
  @IsOptional()
  status?: string = 'pending';

  @IsOptional()
  @IsMongoId()
  relatedConsumerId?: string;

  @IsOptional()
  @IsMongoId()
  relatedLeadId?: string;

  @IsOptional()
  @IsMongoId()
  relatedOrderId?: string;

  @IsOptional()
  @IsMongoId()
  relatedHistoryId?: string;

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean = true;

  @IsOptional()
  @IsBoolean()
  smsNotification?: boolean = false;

  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean = true;

  @IsOptional()
  @IsNumber()
  notificationMinutesBefore?: number = 30;

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  recurringPattern?: string;

  @IsOptional()
  @IsNumber()
  recurringInterval?: number;

  @IsOptional()
  @IsDateString()
  recurringEndDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsMongoId()
  assignedTo: string;

  @IsMongoId()
  createdBy: string;

  @IsOptional()
  @IsMongoId()
  updatedBy?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}
