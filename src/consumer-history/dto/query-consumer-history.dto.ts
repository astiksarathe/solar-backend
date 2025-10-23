import {
  IsOptional,
  IsString,
  IsEnum,
  IsDateString,
  IsNumber,
  IsMongoId,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryConsumerHistoryDto {
  @IsOptional()
  @IsMongoId()
  consumerId?: string;

  @IsOptional()
  @IsString()
  consumerNumber?: string;

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
  ])
  interactionType?: string;

  @IsOptional()
  @IsEnum(['pending', 'completed', 'cancelled', 'rescheduled'])
  status?: string;

  @IsOptional()
  @IsMongoId()
  assignedTo?: string;

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
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value as string))
  @IsNumber()
  limit?: number = 10;

  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}