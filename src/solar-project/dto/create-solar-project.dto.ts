import {
  IsString,
  IsOptional,
  IsArray,
  IsNumber,
  IsBoolean,
} from 'class-validator';

export class CreateSolarProjectDto {
  @IsString()
  name: string;

  @IsString()
  consumerNumber: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  divisionName?: string;

  @IsString()
  mobileNumber: string;

  @IsString()
  purpose: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  amount?: number[];

  @IsOptional()
  @IsNumber()
  avgMonthlyBill?: number;

  @IsOptional()
  @IsString()
  propertyType?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsBoolean()
  isConverted?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  assignedTo?: string;
}
