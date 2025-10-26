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
} from 'class-validator';
import { Type } from 'class-transformer';

class ReminderDto {
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
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string = 'medium';

  @IsOptional()
  @IsBoolean()
  isCritical?: boolean = false;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsNumber()
  expectedDuration?: number;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  notificationIntervals?: number[] = [60, 15];

  @IsOptional()
  @IsBoolean()
  emailNotification?: boolean = false;

  @IsOptional()
  @IsBoolean()
  smsNotification?: boolean = false;

  @IsOptional()
  @IsBoolean()
  whatsappNotification?: boolean = false;

  @IsOptional()
  @IsBoolean()
  pushNotification?: boolean = true;
}

class ProposalDetailsDto {
  @IsOptional()
  @IsString()
  systemSize?: string;

  @IsOptional()
  @IsNumber()
  estimatedCost?: number;

  @IsOptional()
  @IsNumber()
  monthlyGeneration?: number;

  @IsOptional()
  @IsString()
  panelType?: string;

  @IsOptional()
  @IsString()
  inverterType?: string;

  @IsOptional()
  @IsString()
  roofType?: string;

  @IsOptional()
  @IsNumber()
  estimatedSavings?: number;

  @IsOptional()
  @IsNumber()
  paybackPeriod?: number;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];
}

export class CreateLeadDto {
  @IsOptional()
  @IsMongoId()
  consumerId?: string;

  @IsOptional()
  @IsString()
  consumerNumber?: string;

  // Direct customer information (for leads not from consumer data)
  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  emailAddress?: string;

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
  @IsEnum([
    'consumer_data',
    'direct_inquiry',
    'marketing',
    'referral',
    'cold_call',
    'trade_show',
    'walk_in',
    'self',
  ])
  leadType?: string = 'self';

  @IsOptional()
  @IsString()
  leadSource?: string;

  @IsEnum([
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiation',
    'closed',
  ])
  @IsOptional()
  status?: string = 'new';

  @IsOptional()
  @IsString()
  priority?: string = 'medium';

  @IsOptional()
  @IsEnum(['residential', 'commercial', 'industrial'])
  customerType?: string;

  @IsOptional()
  @IsNumber()
  estimatedValue?: number;

  @IsOptional()
  @IsNumber()
  probability?: number;

  @IsOptional()
  @IsDateString()
  expectedCloseDate?: string;

  @IsOptional()
  @IsString()
  requirementDescription?: string;

  @IsOptional()
  @IsString()
  currentEnergyProvider?: string;

  @IsOptional()
  @IsNumber()
  monthlyElectricityBill?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  roofCondition?: string;

  @IsOptional()
  @IsBoolean()
  hasShading?: boolean;

  @IsOptional()
  @IsString()
  electricityUsagePattern?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  incentivesApplicable?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ProposalDetailsDto)
  proposalDetails?: ProposalDetailsDto;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsDateString()
  lastContactDate?: string;

  @IsOptional()
  @IsDateString()
  nextFollowUp?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

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

  // === REMINDER CREATION ===
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ReminderDto)
  @IsArray()
  reminders?: ReminderDto[];
}
