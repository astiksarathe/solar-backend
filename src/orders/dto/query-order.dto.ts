import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryOrderDto {
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
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsEnum(['residential', 'commercial', 'industrial'])
  customerType?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  orderNumber?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  systemSize?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsDateString()
  installationFromDate?: string;

  @IsOptional()
  @IsDateString()
  installationToDate?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minSystemCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxSystemCapacity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsEnum([
    'orderDate',
    'orderNumber',
    'customerName',
    'status',
    'pricing.total',
    'systemCapacity',
    'estimatedInstallationDate',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string = 'orderDate';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  @IsOptional()
  @IsString()
  installationTeamLead?: string;

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  batteryIncluded?: boolean;

  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  governmentSubsidy?: boolean;

  @IsOptional()
  @IsEnum(['pending', 'partial', 'completed'])
  paymentStatus?: string;
}

export class OrderStatsQueryDto {
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'yearly'])
  groupBy?: string = 'monthly';

  @IsOptional()
  @IsEnum(['residential', 'commercial', 'industrial'])
  customerType?: string;
}

export class OrderExportDto {
  @IsOptional()
  @IsEnum(['excel', 'csv', 'pdf'])
  format?: string = 'excel';

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  customerType?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean = false;
}
