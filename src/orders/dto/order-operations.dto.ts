import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsArray,
  IsMongoId,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class PaymentRecordDto {
  @IsDateString()
  paymentDate: string;

  @IsNumber()
  amount: number;

  @IsEnum(['cash', 'bank_transfer', 'cheque', 'online', 'card'])
  paymentMethod: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  @IsOptional()
  status?: string = 'pending';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  receiptNumber?: string;

  @IsOptional()
  @IsString()
  bankDetails?: string;
}

export class AddPaymentDto {
  @ValidateNested()
  @Type(() => PaymentRecordDto)
  payment: PaymentRecordDto;

  @IsOptional()
  @IsString()
  updatedBy?: string;
}

export class UpdatePaymentStatusDto {
  @IsEnum(['pending', 'completed', 'failed', 'refunded'])
  status: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsString()
  updatedBy: string;
}

export class InstallationScheduleDto {
  @IsDateString()
  estimatedInstallationDate: string;

  @IsOptional()
  @IsMongoId()
  installationTeamLead?: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  installationTeam?: string[];

  @IsOptional()
  @IsString()
  installationNotes?: string;

  @IsString()
  updatedBy: string;
}

export class InstallationUpdateDto {
  @IsOptional()
  @IsDateString()
  actualInstallationDate?: string;

  @IsOptional()
  @IsDateString()
  installationCompletionDate?: string;

  @IsOptional()
  @IsDateString()
  commissioningDate?: string;

  @IsOptional()
  @IsDateString()
  warrantyStartDate?: string;

  @IsOptional()
  @IsDateString()
  warrantyEndDate?: string;

  @IsOptional()
  @IsString()
  installationNotes?: string;

  @IsOptional()
  @IsEnum(['scheduled', 'in_progress', 'completed', 'on_hold', 'cancelled'])
  installationStatus?: string;

  @IsString()
  updatedBy: string;
}

export class DocumentUploadDto {
  @IsEnum([
    'site_survey',
    'electrical_drawing',
    'structural_drawing',
    'permit_application',
    'permit_approval',
    'interconnection_agreement',
    'installation_photos',
    'commissioning_report',
    'completion_certificate',
    'warranty_documents',
    'invoice',
    'payment_receipt',
    'other',
  ])
  documentType: string;

  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  uploadedBy: string;
}

export class OrderStatusUpdateDto {
  @IsEnum([
    'draft',
    'pending_approval',
    'confirmed',
    'in_progress',
    'installation_scheduled',
    'installation_in_progress',
    'installation_completed',
    'commissioning',
    'completed',
    'cancelled',
    'on_hold',
  ])
  status: string;

  @IsOptional()
  @IsString()
  statusNotes?: string;

  @IsOptional()
  @IsDateString()
  statusChangeDate?: string;

  @IsString()
  updatedBy: string;
}

export class OrderAssignmentDto {
  @IsMongoId()
  assignedTo: string;

  @IsOptional()
  @IsString()
  assignmentNotes?: string;

  @IsString()
  updatedBy: string;
}

export class BulkOrderUpdateDto {
  @IsArray()
  @IsMongoId({ each: true })
  orderIds: string[];

  @IsOptional()
  @IsEnum([
    'draft',
    'pending_approval',
    'confirmed',
    'in_progress',
    'installation_scheduled',
    'installation_in_progress',
    'installation_completed',
    'commissioning',
    'completed',
    'cancelled',
    'on_hold',
  ])
  status?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsString()
  updatedBy: string;
}

export class OrderPerformanceDto {
  @IsOptional()
  @IsNumber()
  estimatedAnnualGeneration?: number;

  @IsOptional()
  @IsNumber()
  estimatedMonthlySavings?: number;

  @IsOptional()
  @IsNumber()
  estimatedAnnualSavings?: number;

  @IsOptional()
  @IsNumber()
  paybackPeriod?: number;

  @IsOptional()
  @IsNumber()
  co2OffsetAnnual?: number;

  @IsOptional()
  @IsNumber()
  roiPercentage?: number;

  @IsString()
  updatedBy: string;
}
