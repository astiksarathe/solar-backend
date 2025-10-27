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

class CostBreakdownItemDto {
  @IsString()
  category: string;

  @IsString()
  item: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  quantity: number;

  @IsString()
  unit: string;

  @IsNumber()
  unitPrice: number;

  @IsNumber()
  totalPrice: number;

  @IsOptional()
  @IsString()
  supplier?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  discountPercent?: number;

  @IsOptional()
  @IsNumber()
  taxPercent?: number;

  @IsOptional()
  @IsString()
  warranty?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

class PaymentDetailsDto {
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @IsOptional()
  @IsNumber()
  advanceAmount?: number;

  @IsOptional()
  @IsNumber()
  pendingAmount?: number;

  @IsOptional()
  @IsString()
  paymentTerms?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  paymentSchedule?: string[];

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}

class InstallationDetailsDto {
  @IsOptional()
  @IsDateString()
  scheduledDate?: string;

  @IsOptional()
  @IsDateString()
  completedDate?: string;

  @IsOptional()
  @IsString()
  installationTeam?: string;

  @IsOptional()
  @IsString()
  installationNotes?: string;

  @IsOptional()
  @IsString()
  equipmentDeliveryStatus?: string;

  @IsOptional()
  @IsString()
  siteSurveyStatus?: string;

  @IsOptional()
  @IsString()
  permitsStatus?: string;

  @IsOptional()
  @IsString()
  gridConnectionStatus?: string;
}

class PerformanceEstimatesDto {
  @IsOptional()
  @IsNumber()
  annualGeneration?: number;

  @IsOptional()
  @IsNumber()
  firstYearSavings?: number;

  @IsOptional()
  @IsNumber()
  lifetimeSavings?: number;

  @IsOptional()
  @IsNumber()
  co2OffsetAnnual?: number;

  @IsOptional()
  @IsNumber()
  paybackPeriodYears?: number;

  @IsOptional()
  @IsNumber()
  roi?: number;
}

export class CreateOrderDto {
  @IsMongoId()
  consumerId: string;

  @IsString()
  orderNumber: string;

  @IsEnum(['draft', 'confirmed', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string = 'draft';

  @IsOptional()
  @IsString()
  priority?: string = 'medium';

  @IsString()
  customerName: string;

  @IsString()
  customerPhone: string;

  @IsOptional()
  @IsString()
  customerEmail?: string;

  @IsString()
  installationAddress: string;

  @IsOptional()
  @IsString()
  billingAddress?: string;

  @IsString()
  systemSize: string;

  @IsOptional()
  @IsString()
  systemType?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CostBreakdownItemDto)
  costBreakdown: CostBreakdownItemDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails?: PaymentDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => InstallationDetailsDto)
  installationDetails?: InstallationDetailsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PerformanceEstimatesDto)
  performanceEstimates?: PerformanceEstimatesDto;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documents?: string[];

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  warrantyTerms?: string;

  @IsOptional()
  @IsString()
  maintenancePackage?: string;

  @IsOptional()
  @IsBoolean()
  governmentSubsidy?: boolean;

  @IsOptional()
  @IsString()
  subsidyDetails?: string;

  @IsOptional()
  @IsString()
  financingOption?: string;

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
