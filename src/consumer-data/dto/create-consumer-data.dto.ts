import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsNumber,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsEmail,
  ValidateNested,
  Min,
  Max,
  ArrayMinSize,
  ArrayMaxSize,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

/**
 * DTO for creating new consumer data records
 * Supports both scraped data and manual entry
 */

class ScrapingMetadataDto {
  @ApiPropertyOptional({ description: 'URL from where data was scraped' })
  @IsOptional()
  @IsString()
  sourceUrl?: string;

  @ApiPropertyOptional({ description: 'When the data was scraped' })
  @IsOptional()
  @IsDateString()
  scrapedAt?: string;

  @ApiPropertyOptional({ description: 'Batch identifier for bulk operations' })
  @IsOptional()
  @IsString()
  batchId?: string;

  @ApiPropertyOptional({
    description: 'Quality of scraped data',
    enum: ['complete', 'partial', 'poor'],
  })
  @IsOptional()
  @IsEnum(['complete', 'partial', 'poor'])
  dataQuality?: string;
}

class EnrichmentAttemptsDto {
  @ApiPropertyOptional({ description: 'Email lookup attempted' })
  @IsOptional()
  @IsBoolean()
  emailLookup?: boolean;

  @ApiPropertyOptional({ description: 'Address geocoding attempted' })
  @IsOptional()
  @IsBoolean()
  addressGeocoding?: boolean;

  @ApiPropertyOptional({ description: 'Property details lookup attempted' })
  @IsOptional()
  @IsBoolean()
  propertyDetails?: boolean;

  @ApiPropertyOptional({ description: 'Roof analysis attempted' })
  @IsOptional()
  @IsBoolean()
  roofAnalysis?: boolean;
}

class CoordinatesDto {
  @ApiProperty({
    description: 'Latitude coordinate',
    minimum: -90,
    maximum: 90,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  latitude: number;

  @ApiProperty({
    description: 'Longitude coordinate',
    minimum: -180,
    maximum: 180,
  })
  @IsNumber()
  @Min(-180)
  @Max(180)
  longitude: number;
}

class ParsedAddressDto {
  @ApiPropertyOptional({ description: 'Village name' })
  @IsOptional()
  @IsString()
  village?: string;

  @ApiPropertyOptional({ description: 'Tehsil name' })
  @IsOptional()
  @IsString()
  tehsil?: string;

  @ApiPropertyOptional({ description: 'District name' })
  @IsOptional()
  @IsString()
  district?: string;

  @ApiPropertyOptional({ description: 'State name' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ description: 'PIN code' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiPropertyOptional({ description: 'Geographic coordinates' })
  @IsOptional()
  @ValidateNested()
  @Type(() => CoordinatesDto)
  coordinates?: CoordinatesDto;
}

export class CreateConsumerDataDto {
  // === REQUIRED SCRAPED DATA ===

  @ApiProperty({
    description: 'Consumer name as registered with electricity board',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({ description: 'Unique consumer number from electricity board' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim()?.toUpperCase())
  consumerNumber: string;

  @ApiProperty({ description: 'Full registered address' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  address: string;

  @ApiProperty({ description: 'Administrative division/circle name' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  divisionName: string;

  @ApiProperty({ description: 'Registered mobile number' })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  mobileNumber: string;

  @ApiProperty({
    description: 'Connection purpose/type from electricity board',
  })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  purpose: string;

  @ApiProperty({
    description: 'Last 12 months bill amounts in rupees (latest first)',
    type: [Number],
    minItems: 12,
    maxItems: 12,
  })
  @IsArray()
  @ArrayMinSize(12)
  @ArrayMaxSize(12)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  amount: number[];

  @ApiProperty({
    description: 'Last 12 months unit consumption (latest first)',
    type: [Number],
    minItems: 12,
    maxItems: 12,
  })
  @IsArray()
  @ArrayMinSize(12)
  @ArrayMaxSize(12)
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  last6MonthsUnits: number[];

  @ApiProperty({ description: 'Average monthly units consumption', minimum: 0 })
  @IsNumber()
  @Min(0)
  avgUnits: number;

  // === OPTIONAL ENRICHED DATA ===

  @ApiPropertyOptional({ description: 'Email address (enriched data)' })
  @IsOptional()
  @IsEmail()
  @Transform(({ value }) => value?.trim()?.toLowerCase())
  email?: string;

  @ApiPropertyOptional({
    description: 'Property type derived from purpose',
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

  @ApiPropertyOptional({ description: 'Electricity provider name' })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  electricityProvider?: string;

  @ApiPropertyOptional({
    description: 'Connection billing type',
    enum: ['flat_rate', 'metered', 'subsidized', 'commercial_rate', 'unknown'],
  })
  @IsOptional()
  @IsEnum(['flat_rate', 'metered', 'subsidized', 'commercial_rate', 'unknown'])
  connectionType?: string;

  // === PROCESSING STATUS ===

  @ApiPropertyOptional({
    description: 'Source of this data',
    enum: ['scraped', 'manual', 'imported', 'api'],
    default: 'scraped',
  })
  @IsOptional()
  @IsEnum(['scraped', 'manual', 'imported', 'api'])
  source?: string;

  @ApiPropertyOptional({
    description: 'Current processing status',
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
    default: 'new',
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

  @ApiPropertyOptional({ description: 'Manual notes', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  notes?: string[];

  // === METADATA ===

  @ApiPropertyOptional({ description: 'Scraping metadata' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScrapingMetadataDto)
  scrapingMetadata?: ScrapingMetadataDto;

  @ApiPropertyOptional({ description: 'Data enrichment attempt tracking' })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnrichmentAttemptsDto)
  enrichmentAttempts?: EnrichmentAttemptsDto;

  @ApiPropertyOptional({ description: 'Parsed address components' })
  @IsOptional()
  @ValidateNested()
  @Type(() => ParsedAddressDto)
  parsedAddress?: ParsedAddressDto;

  @ApiPropertyOptional({
    description: 'Preferred communication language',
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
    description: 'Best time to contact',
    enum: ['morning', 'afternoon', 'evening', 'any'],
  })
  @IsOptional()
  @IsEnum(['morning', 'afternoon', 'evening', 'any'])
  bestContactTime?: string;
}
