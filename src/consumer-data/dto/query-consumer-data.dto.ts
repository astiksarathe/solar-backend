import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsEnum,
  IsBoolean,
  IsNumber,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

/**
 * DTO for querying and filtering consumer data
 * Supports advanced search, filtering, sorting, and pagination
 */
export class QueryConsumerDataDto {
  // === SEARCH PARAMETERS ===

  @ApiPropertyOptional({
    description:
      'Search across name, consumer number, mobile number, and address',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by consumer number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  consumerNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by mobile number' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  mobileNumber?: string;

  @ApiPropertyOptional({ description: 'Filter by division name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  divisionName?: string;

  // === STATUS FILTERS ===

  @ApiPropertyOptional({
    description: 'Filter by processing status',
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
  })
  @IsOptional()
  @IsEnum([
    'new',
    'contacted',
    'interested',
    'not_interested',
    'converted',
    'invalid',
  ])
  status?: string;

  @ApiPropertyOptional({
    description: 'Filter by property type',
    enum: [
      'residential',
      'commercial',
      'agricultural',
      'industrial',
      'unknown',
    ],
  })
  @IsOptional()
  @IsEnum([
    'residential',
    'commercial',
    'agricultural',
    'industrial',
    'unknown',
  ])
  propertyType?: string;

  @ApiPropertyOptional({
    description: 'Filter by data source',
    enum: ['scraped', 'manual', 'imported', 'api'],
  })
  @IsOptional()
  @IsEnum(['scraped', 'manual', 'imported', 'api'])
  source?: string;

  @ApiPropertyOptional({ description: 'Filter by conversion status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isConverted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter high consumption customers only',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isHighConsumer?: boolean;

  // === NUMERIC RANGE FILTERS ===

  @ApiPropertyOptional({
    description: 'Minimum average monthly units',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAvgUnits?: number;

  @ApiPropertyOptional({
    description: 'Maximum average monthly units',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxAvgUnits?: number;

  @ApiPropertyOptional({
    description: 'Minimum average monthly bill amount',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minAvgBill?: number;

  @ApiPropertyOptional({
    description: 'Maximum average monthly bill amount',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxAvgBill?: number;

  @ApiPropertyOptional({
    description: 'Minimum qualification score',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  minQualificationScore?: number;

  @ApiPropertyOptional({
    description: 'Maximum qualification score',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  @Max(100)
  maxQualificationScore?: number;

  @ApiPropertyOptional({
    description: 'Minimum estimated solar capacity in kW',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  minSolarCapacity?: number;

  @ApiPropertyOptional({
    description: 'Maximum estimated solar capacity in kW',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  maxSolarCapacity?: number;

  // === DATE RANGE FILTERS ===

  @ApiPropertyOptional({
    description: 'Filter records created after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter records created before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @ApiPropertyOptional({
    description: 'Filter records updated after this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  updatedAfter?: string;

  @ApiPropertyOptional({
    description: 'Filter records updated before this date (ISO 8601)',
  })
  @IsOptional()
  @IsDateString()
  updatedBefore?: string;

  // === GEOGRAPHY FILTERS ===

  @ApiPropertyOptional({ description: 'Filter by state name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  state?: string;

  @ApiPropertyOptional({ description: 'Filter by district name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  district?: string;

  @ApiPropertyOptional({ description: 'Filter by pincode' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  pincode?: string;

  // === COMMUNICATION PREFERENCES ===

  @ApiPropertyOptional({
    description: 'Filter by preferred language',
    enum: [
      'hindi',
      'english',
      'marathi',
      'gujarati',
      'punjabi',
      'tamil',
      'telugu',
      'bengali',
    ],
  })
  @IsOptional()
  @IsEnum([
    'hindi',
    'english',
    'marathi',
    'gujarati',
    'punjabi',
    'tamil',
    'telugu',
    'bengali',
  ])
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Filter by best contact time',
    enum: ['morning', 'afternoon', 'evening', 'any'],
  })
  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening', 'any'])
  bestContactTime?: string;

  // === PAGINATION ===

  @ApiPropertyOptional({
    description: 'Page number for pagination (1-based)',
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 20;

  // === SORTING ===

  @ApiPropertyOptional({
    description: 'Field to sort by',
    enum: [
      'createdAt',
      'updatedAt',
      'name',
      'avgUnits',
      'avgMonthlyBill',
      'qualificationScore',
      'estimatedSolarCapacity',
      'estimatedMonthlySavings',
    ],
    default: 'createdAt',
  })
  @IsOptional()
  @IsEnum([
    'createdAt',
    'updatedAt',
    'name',
    'avgUnits',
    'avgMonthlyBill',
    'qualificationScore',
    'estimatedSolarCapacity',
    'estimatedMonthlySavings',
  ])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    default: 'desc',
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: string = 'desc';

  // === ADVANCED FILTERS ===

  @ApiPropertyOptional({
    description: 'Include only records with email addresses',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Include only records with geocoded addresses',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  hasCoordinates?: boolean;

  @ApiPropertyOptional({
    description: 'Filter by data quality',
    enum: ['complete', 'partial', 'poor'],
  })
  @IsOptional()
  @IsEnum(['complete', 'partial', 'poor'])
  dataQuality?: string;

  @ApiPropertyOptional({
    description: 'Include only potential leads (high qualification score)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  potentialLeadsOnly?: boolean;

  // === ENRICHMENT STATUS ===

  @ApiPropertyOptional({
    description: 'Include only records where email lookup was attempted',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  emailLookupAttempted?: boolean;

  @ApiPropertyOptional({
    description: 'Include only records where geocoding was attempted',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  geocodingAttempted?: boolean;
}
