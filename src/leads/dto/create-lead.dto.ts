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
  @IsMongoId()
  consumerId: string;

  @IsString()
  consumerNumber: string;

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
}
