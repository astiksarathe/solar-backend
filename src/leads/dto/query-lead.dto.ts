import {
  IsOptional,
  IsString,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryLeadDto {
  @ApiProperty({
    description: 'Filter by lead status',
    enum: [
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'negotiation',
      'closed_won',
      'closed_lost',
    ],
    required: false,
    example: 'qualified',
  })
  @IsOptional()
  @IsEnum([
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'negotiation',
    'closed_won',
    'closed_lost',
  ])
  status?: string;

  @ApiProperty({
    description: 'Filter by lead priority',
    enum: ['cold', 'warm', 'hot'],
    required: false,
    example: 'hot',
  })
  @IsOptional()
  @IsEnum(['cold', 'warm', 'hot'])
  priority?: string;

  @ApiProperty({
    description: 'Filter by customer interest level',
    enum: [
      'not_interested',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
    ],
    required: false,
    example: 'very_interested',
  })
  @IsOptional()
  @IsEnum([
    'not_interested',
    'interested',
    'very_interested',
    'ready_to_buy',
    'needs_time',
    'price_negotiation',
  ])
  interestLevel?: string;

  @ApiProperty({
    description: 'Filter by customer type',
    enum: ['residential', 'commercial', 'industrial'],
    required: false,
    example: 'residential',
  })
  @IsOptional()
  @IsEnum(['residential', 'commercial', 'industrial'])
  customerType?: string;

  @ApiProperty({
    description: 'Filter by lead source',
    required: false,
    example: 'website',
  })
  @IsOptional()
  @IsString()
  leadSource?: string;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    required: false,
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Filter by consumer ID',
    required: false,
    example: '507f1f77bcf86cd799439012',
  })
  @IsOptional()
  @IsString()
  consumerId?: string;

  @ApiProperty({
    description: 'Filter by consumer number',
    required: false,
    example: 'CON-2024-0001',
  })
  @IsOptional()
  @IsString()
  consumerNumber?: string;

  @ApiProperty({
    description: 'Filter by customer name',
    required: false,
    example: 'John Doe',
  })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({
    description: 'Filter by phone number',
    required: false,
    example: '+91-9876543210',
  })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({
    description: 'Filter by email address',
    required: false,
    example: 'john.doe@example.com',
  })
  @IsOptional()
  @IsString()
  emailAddress?: string;

  @ApiProperty({
    description:
      'Search across multiple fields (name, phone, email, address, notes)',
    required: false,
    example: 'john doe',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Start date for filtering (ISO format)',
    required: false,
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'End date for filtering (ISO format)',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Start date for expected closing date filter',
    required: false,
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  expectedCloseFromDate?: string;

  @ApiProperty({
    description: 'End date for expected closing date filter',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expectedCloseToDate?: string;

  @ApiProperty({
    description: 'Start date for next follow-up filter',
    required: false,
    example: '2024-12-15',
  })
  @IsOptional()
  @IsDateString()
  followUpFromDate?: string;

  @ApiProperty({
    description: 'End date for next follow-up filter',
    required: false,
    example: '2024-12-20',
  })
  @IsOptional()
  @IsDateString()
  followUpToDate?: string;

  @ApiProperty({
    description: 'Minimum estimated budget',
    required: false,
    example: 100000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minBudget?: number;

  @ApiProperty({
    description: 'Maximum estimated budget',
    required: false,
    example: 1000000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxBudget?: number;

  @ApiProperty({
    description: 'Minimum monthly electricity bill',
    required: false,
    example: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minMonthlyBill?: number;

  @ApiProperty({
    description: 'Maximum monthly electricity bill',
    required: false,
    example: 50000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxMonthlyBill?: number;

  @ApiProperty({
    description: 'Minimum rooftop area in sq ft',
    required: false,
    example: 200,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRooftopArea?: number;

  @ApiProperty({
    description: 'Maximum rooftop area in sq ft',
    required: false,
    example: 2000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRooftopArea?: number;

  @ApiProperty({
    description: 'System size filter (e.g., "5kW", "10kW")',
    required: false,
    example: '5kW',
  })
  @IsOptional()
  @IsString()
  systemSize?: string;

  @ApiProperty({
    description: 'Filter by tags (comma-separated)',
    required: false,
    example: 'high_priority,hot_lead',
  })
  @IsOptional()
  @IsString()
  tags?: string;

  @ApiProperty({
    description: 'Filter leads with proposals',
    required: false,
    example: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasProposal?: boolean;

  @ApiProperty({
    description: 'Filter leads that are overdue for follow-up',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  overdueFollowUp?: boolean;

  @ApiProperty({
    description: 'Filter leads converted to orders',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isConverted?: boolean;

  @ApiProperty({
    description: 'Page number for pagination',
    required: false,
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    example: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Field to sort by',
    enum: [
      'customerName',
      'status',
      'priority',
      'interestLevel',
      'estimatedBudget',
      'customerType',
      'expectedClosingDate',
      'nextFollowUpDate',
      'lastContactDate',
      'createdAt',
      'updatedAt',
    ],
    required: false,
    example: 'createdAt',
  })
  @IsOptional()
  @IsEnum([
    'customerName',
    'status',
    'priority',
    'interestLevel',
    'estimatedBudget',
    'customerType',
    'expectedClosingDate',
    'nextFollowUpDate',
    'lastContactDate',
    'createdAt',
    'updatedAt',
  ])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    required: false,
    example: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';
}

export class LeadStatsQueryDto {
  @ApiProperty({
    description: 'Filter statistics by assigned user ID',
    required: false,
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Start date for statistics',
    required: false,
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'End date for statistics',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Group statistics by time period',
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
    required: false,
    example: 'monthly',
  })
  @IsOptional()
  @IsEnum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])
  groupBy?: string = 'monthly';

  @ApiProperty({
    description: 'Filter by customer type',
    enum: ['residential', 'commercial', 'industrial'],
    required: false,
    example: 'residential',
  })
  @IsOptional()
  @IsEnum(['residential', 'commercial', 'industrial'])
  customerType?: string;

  @ApiProperty({
    description: 'Filter by lead source',
    required: false,
    example: 'website',
  })
  @IsOptional()
  @IsString()
  leadSource?: string;
}

export class LeadExportDto {
  @ApiProperty({
    description: 'Export format',
    enum: ['excel', 'csv', 'pdf'],
    required: false,
    example: 'excel',
  })
  @IsOptional()
  @IsEnum(['excel', 'csv', 'pdf'])
  format?: string = 'excel';

  @ApiProperty({
    description: 'Filter by lead status',
    required: false,
    example: 'qualified',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    description: 'Filter by customer type',
    required: false,
    example: 'residential',
  })
  @IsOptional()
  @IsString()
  customerType?: string;

  @ApiProperty({
    description: 'Start date for export',
    required: false,
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiProperty({
    description: 'End date for export',
    required: false,
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiProperty({
    description: 'Filter by assigned user ID',
    required: false,
    example: '507f1f77bcf86cd799439013',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiProperty({
    description: 'Include detailed information in export',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  includeDetails?: boolean = false;

  @ApiProperty({
    description: 'Include proposal details in export',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  includeProposals?: boolean = false;

  @ApiProperty({
    description: 'Include communication history in export',
    required: false,
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  includeCommunication?: boolean = false;
}
