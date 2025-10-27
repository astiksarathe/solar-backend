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
  ValidateNested,
  Min,
  Max,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

// Sub-DTOs for complex nested objects (Order matters for dependencies)
export class CoordinatesDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

export class ContactDetailsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  customerName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(15)
  alternatePhone?: string;

  @IsOptional()
  @IsEnum(['phone', 'email', 'whatsapp', 'sms'])
  preferredContactMethod?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  bestTimeToCall?: string;
}

export class LocationDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  landmark?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  instructions?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  travelTime?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  parkingInfo?: string;
}

export class DocumentDto {
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

  @IsOptional()
  @IsBoolean()
  required?: boolean = true;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class PreparationItemDto {
  @IsString()
  @MaxLength(100)
  item: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number = 1;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class TeamMemberDto {
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  role?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];
}

export class FollowUpActionDto {
  @IsString()
  @MaxLength(200)
  action: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string = 'medium';

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}

export class RecurringPatternDto {
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  frequency: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  interval?: number = 1;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  maxOccurrences?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  @Max(6, { each: true })
  daysOfWeek?: number[];

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  dayOfMonth?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  weekOfMonth?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  @Max(12, { each: true })
  monthsOfYear?: number[];

  @IsOptional()
  @IsBoolean()
  skipHolidays?: boolean = false;

  @IsOptional()
  @IsString()
  timezone?: string = 'Asia/Kolkata';
}

export class NotificationsDto {
  @IsOptional()
  @IsBoolean()
  email?: boolean = false;

  @IsOptional()
  @IsBoolean()
  sms?: boolean = false;

  @IsOptional()
  @IsBoolean()
  whatsapp?: boolean = false;

  @IsOptional()
  @IsBoolean()
  push?: boolean = true;

  @IsOptional()
  @IsBoolean()
  calendar?: boolean = false;
}

export class CostDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  travelCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  materialCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  laborCost?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  miscCost?: number;

  @IsOptional()
  @IsString()
  currency?: string = 'INR';
}

export class WeatherRequirementsDto {
  @IsOptional()
  @IsNumber()
  minTemperature?: number;

  @IsOptional()
  @IsNumber()
  maxTemperature?: number;

  @IsOptional()
  @IsBoolean()
  avoidRain?: boolean = true;

  @IsOptional()
  @IsBoolean()
  avoidStrongWind?: boolean = true;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class QualityChecklistDto {
  @IsString()
  @MaxLength(100)
  item: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  notes?: string;
}

export class IntegrationsDto {
  @IsOptional()
  @IsBoolean()
  calendarSync?: boolean = false;

  @IsOptional()
  @IsBoolean()
  crmSync?: boolean = false;

  @IsOptional()
  @IsString()
  googleCalendarId?: string;

  @IsOptional()
  @IsString()
  outlookEventId?: string;
}

export class CreateReminderDto {
  // === ENTITY REFERENCE ===
  @IsMongoId()
  entityId: string;

  @IsEnum(['ConsumerData', 'Order'])
  entityModel: string;

  // === REMINDER DETAILS ===
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
  type: string;

  @IsDateString()
  scheduledAt: string;

  @IsString()
  @MaxLength(200)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  // === ASSIGNMENT ===
  @IsString()
  assignedTo: string;

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

  // === PRIORITY ===
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string = 'medium';

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean = false;

  // === CONTACT AND LOCATION ===
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactDetailsDto)
  contactDetails?: ContactDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;

  // === DOCUMENTS ===
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DocumentDto)
  documents?: DocumentDto[];

  // === PREPARATION ===
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreparationItemDto)
  preparationItems?: PreparationItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TeamMemberDto)
  teamMembers?: TeamMemberDto[];

  // === FOLLOW-UP ACTIONS ===
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FollowUpActionDto)
  followUpActions?: FollowUpActionDto[];

  // === RECURRING PATTERN ===
  @IsOptional()
  @IsBoolean()
  isRecurring?: boolean = false;

  @IsOptional()
  @ValidateNested()
  @Type(() => RecurringPatternDto)
  recurringPattern?: RecurringPatternDto;

  @IsOptional()
  @IsMongoId()
  parentReminderId?: string;

  // === NOTIFICATIONS ===
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationsDto)
  notifications?: NotificationsDto;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(1, { each: true })
  notificationIntervals?: number[] = [60, 15];

  // === ACTIVITY DETAILS ===
  @IsOptional()
  @IsNumber()
  @Min(5)
  @Max(600)
  expectedDuration?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => CostDto)
  cost?: CostDto;

  // === EXTERNAL INTEGRATIONS ===
  @IsOptional()
  @IsString()
  externalCalendarEventId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => IntegrationsDto)
  integrations?: IntegrationsDto;

  // === WEATHER CONSIDERATIONS ===
  @IsOptional()
  @IsBoolean()
  weatherDependent?: boolean = false;

  @IsOptional()
  @ValidateNested()
  @Type(() => WeatherRequirementsDto)
  weatherRequirements?: WeatherRequirementsDto;

  // === QUALITY ASSURANCE ===
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QualityChecklistDto)
  qualityChecklist?: QualityChecklistDto[];

  // === TAGS AND CATEGORIZATION ===
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'critical'])
  businessImpact?: string = 'medium';

  // === CUSTOM FIELDS ===
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;

  // === AUDIT FIELDS ===
  @IsString()
  createdBy: string;
}
