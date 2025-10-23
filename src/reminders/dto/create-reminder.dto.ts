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
  type: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  scheduledAt: string;

  @IsEnum(['low', 'medium', 'high', 'urgent'])
  @IsOptional()
  priority?: string = 'medium';

  @IsEnum(['pending', 'completed', 'cancelled', 'rescheduled', 'in_progress', 'overdue'])
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
  @IsMongoId()
  entityId?: string;

  @IsOptional()
  @IsEnum(['ConsumerData', 'Lead', 'Order'])
  entityModel?: string;

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean = false;

  @IsOptional()
  @IsEnum(['sales', 'technical', 'installation', 'admin', 'management'])
  department?: string;

  @IsOptional()
  @IsObject()
  notifications?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    push?: boolean;
  };

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  notificationIntervals?: number[];

  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @IsOptional()
  @IsObject()
  recurringPattern?: {
    frequency?: string;
    interval?: number;
    endDate?: Date;
    maxOccurrences?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };

  @IsOptional()
  @IsMongoId()
  parentReminderId?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  assignedTo: string;

  @IsString()
  createdBy: string;

  @IsOptional()
  @IsString()
  updatedBy?: string;

  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  expectedDuration?: number;

  @IsOptional()
  @IsBoolean()
  weatherDependent?: boolean = false;

  @IsOptional()
  @IsString()
  externalCalendarEventId?: string;
}
