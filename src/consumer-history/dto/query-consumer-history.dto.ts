import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsMongoId,
  IsArray,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryConsumerHistoryDto {
  @ApiPropertyOptional({
    description: 'Consumer ID to filter interactions',
    example: '675b8e5a1234567890abcdef',
  })
  @IsOptional()
  @IsMongoId()
  consumerId?: string;

  @ApiPropertyOptional({
    description: 'Consumer number to search',
    example: 'CONS-001',
  })
  @IsOptional()
  @IsString()
  consumerNumber?: string;

  @ApiPropertyOptional({
    description: 'Type of interaction',
    enum: [
      'call',
      'meeting',
      'site_visit',
      'email',
      'whatsapp',
      'follow_up',
      'quote_sent',
      'proposal_sent',
      'survey',
      'installation_visit',
      'maintenance',
      'complaint',
      'payment_follow_up',
    ],
    example: 'call',
  })
  @IsOptional()
  @IsEnum([
    'call',
    'meeting',
    'site_visit',
    'email',
    'whatsapp',
    'follow_up',
    'quote_sent',
    'proposal_sent',
    'survey',
    'installation_visit',
    'maintenance',
    'complaint',
    'payment_follow_up',
  ])
  interactionType?: string;

  @ApiPropertyOptional({
    description: 'Status of interaction',
    enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
    example: 'completed',
  })
  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled', 'rescheduled'])
  status?: string;

  @ApiPropertyOptional({
    description: 'User assigned to interaction',
    example: '675b8e5a1234567890abcd01',
  })
  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

  @ApiPropertyOptional({
    description: 'Priority level filter',
    enum: ['low', 'medium', 'high', 'urgent'],
    example: 'high',
  })
  @IsOptional()
  @IsEnum(['low', 'medium', 'high', 'urgent'])
  priority?: string;

  @ApiPropertyOptional({
    description: 'Interest level filter',
    enum: [
      'not_interested',
      'low_interest',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
      'comparing_options',
      'budget_constraints',
    ],
    example: 'very_interested',
  })
  @IsOptional()
  @IsEnum([
    'not_interested',
    'low_interest',
    'interested',
    'very_interested',
    'ready_to_buy',
    'needs_time',
    'price_negotiation',
    'comparing_options',
    'budget_constraints',
  ])
  interestLevel?: string;

  @ApiPropertyOptional({
    description: 'Interaction outcome filter',
    enum: [
      'successful',
      'needs_follow_up',
      'rejected',
      'postponed',
      'converted',
      'no_response',
      'information_gathering',
    ],
    example: 'successful',
  })
  @IsOptional()
  @IsEnum([
    'successful',
    'needs_follow_up',
    'rejected',
    'postponed',
    'converted',
    'no_response',
    'information_gathering',
  ])
  outcome?: string;

  @ApiPropertyOptional({
    description: 'Tags to filter by',
    example: ['hot_lead', 'residential'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Search in title, description, notes, contact person',
    example: 'solar panel discussion',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (scheduled date)',
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({
    description: 'End date for filtering (scheduled date)',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by next follow-up date from',
    example: '2024-12-01',
  })
  @IsOptional()
  @IsDateString()
  followUpFromDate?: string;

  @ApiPropertyOptional({
    description: 'Filter by next follow-up date to',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  followUpToDate?: string;

  @ApiPropertyOptional({
    description: 'Minimum estimated budget',
    example: 100000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  minBudget?: number;

  @ApiPropertyOptional({
    description: 'Maximum estimated budget',
    example: 1000000,
    minimum: 0,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value as string))
  @IsNumber()
  maxBudget?: number;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Field to sort by',
    example: 'scheduledDate',
    default: 'createdAt',
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: ['asc', 'desc'],
    example: 'desc',
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}
