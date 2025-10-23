import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Response DTO for consumer data with computed fields
 * Used for API responses with additional calculated information
 */
export class ConsumerDataResponseDto {
  @ApiProperty({ description: 'Unique identifier' })
  _id: string;

  // === BASIC INFORMATION ===
  @ApiProperty({
    description: 'Consumer name as registered with electricity board',
  })
  name: string;

  @ApiProperty({ description: 'Unique consumer number from electricity board' })
  consumerNumber: string;

  @ApiProperty({ description: 'Full registered address' })
  address: string;

  @ApiProperty({ description: 'Administrative division/circle name' })
  divisionName: string;

  @ApiProperty({ description: 'Registered mobile number' })
  mobileNumber: string;

  @ApiProperty({
    description: 'Connection purpose/type from electricity board',
  })
  purpose: string;

  @ApiProperty({
    description: 'Last 12 months bill amounts in rupees',
    type: [Number],
  })
  amount: number[];

  @ApiProperty({
    description: 'Last 12 months unit consumption',
    type: [Number],
  })
  last6MonthsUnits: number[];

  @ApiProperty({ description: 'Average monthly units consumption' })
  avgUnits: number;

  // === COMPUTED FIELDS ===
  @ApiPropertyOptional({
    description: 'Average monthly bill amount (calculated)',
  })
  avgMonthlyBill?: number;

  @ApiPropertyOptional({
    description: 'Whether this is a high consumption customer',
  })
  isHighConsumer?: boolean;

  @ApiPropertyOptional({
    description: 'AI/ML calculated qualification score (0-100)',
  })
  qualificationScore?: number;

  @ApiPropertyOptional({ description: 'Estimated solar system capacity in kW' })
  estimatedSolarCapacity?: number;

  @ApiPropertyOptional({
    description: 'Estimated monthly savings with solar in rupees',
  })
  estimatedMonthlySavings?: number;

  @ApiPropertyOptional({ description: 'Estimated payback period in months' })
  estimatedPaybackMonths?: number;

  // === ENRICHED DATA ===
  @ApiPropertyOptional({ description: 'Email address (enriched data)' })
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
  propertyType?: string;

  @ApiPropertyOptional({ description: 'Electricity provider name' })
  electricityProvider?: string;

  @ApiPropertyOptional({
    description: 'Connection billing type',
    enum: ['flat_rate', 'metered', 'subsidized', 'commercial_rate', 'unknown'],
  })
  connectionType?: string;

  // === STATUS ===
  @ApiProperty({
    description: 'Current processing status',
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
  })
  status: string;

  @ApiProperty({
    description: 'Source of this data',
    enum: ['scraped', 'manual', 'imported', 'api'],
  })
  source: string;

  @ApiProperty({
    description: 'Whether this consumer has been converted to a lead',
  })
  isConverted: boolean;

  // === GEOGRAPHIC DATA ===
  @ApiPropertyOptional({ description: 'Parsed address components' })
  parsedAddress?: {
    village?: string;
    tehsil?: string;
    district?: string;
    state?: string;
    pincode?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // === COMMUNICATION PREFERENCES ===
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
  preferredLanguage?: string;

  @ApiPropertyOptional({
    description: 'Best time to contact',
    enum: ['morning', 'afternoon', 'evening', 'any'],
  })
  bestContactTime?: string;

  // === METADATA ===
  @ApiPropertyOptional({ description: 'Scraping metadata' })
  scrapingMetadata?: {
    sourceUrl?: string;
    scrapedAt?: Date;
    batchId?: string;
    dataQuality?: string;
  };

  @ApiPropertyOptional({ description: 'Data enrichment attempt tracking' })
  enrichmentAttempts?: {
    emailLookup?: boolean;
    addressGeocoding?: boolean;
    propertyDetails?: boolean;
    roofAnalysis?: boolean;
  };

  @ApiProperty({ description: 'Manual notes', type: [String] })
  notes: string[];

  // === TIMESTAMPS ===
  @ApiProperty({ description: 'Record creation date' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update date' })
  updatedAt: Date;
}

/**
 * Paginated response DTO for consumer data lists
 */
export class PaginatedConsumerDataResponseDto {
  @ApiProperty({
    description: 'Array of consumer data records',
    type: [ConsumerDataResponseDto],
  })
  data: ConsumerDataResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };

  @ApiPropertyOptional({
    description: 'Summary statistics for the filtered dataset',
  })
  summary?: {
    totalRecords: number;
    highConsumers: number;
    potentialLeads: number;
    avgQualificationScore: number;
    avgMonthlyBill: number;
    avgUnits: number;
    statusBreakdown: Record<string, number>;
    propertyTypeBreakdown: Record<string, number>;
  };
}

/**
 * Response DTO for bulk operations
 */
export class BulkOperationResponseDto {
  @ApiProperty({ description: 'Number of records processed successfully' })
  successCount: number;

  @ApiProperty({ description: 'Number of records that failed processing' })
  errorCount: number;

  @ApiProperty({ description: 'Total number of records processed' })
  totalCount: number;

  @ApiProperty({
    description: 'Array of successfully processed record IDs',
    type: [String],
  })
  successIds: string[];

  @ApiProperty({ description: 'Array of errors encountered during processing' })
  errors: Array<{
    index: number;
    record?: any;
    error: string;
    details?: any;
  }>;

  @ApiProperty({ description: 'Overall operation status' })
  status: 'completed' | 'partial' | 'failed';

  @ApiPropertyOptional({ description: 'Additional processing information' })
  metadata?: {
    processingTime: number; // milliseconds
    batchId?: string;
    duplicatesSkipped?: number;
    validationErrors?: number;
  };
}

/**
 * Statistics response DTO
 */
export class ConsumerDataStatsResponseDto {
  @ApiProperty({ description: 'Total number of consumer records' })
  totalRecords: number;

  @ApiProperty({ description: 'Breakdown by status' })
  statusStats: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by property type' })
  propertyTypeStats: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by source' })
  sourceStats: Record<string, number>;

  @ApiProperty({ description: 'Breakdown by division' })
  divisionStats: Record<string, number>;

  @ApiProperty({ description: 'Average metrics' })
  averages: {
    avgUnits: number;
    avgMonthlyBill: number;
    qualificationScore: number;
    estimatedSolarCapacity: number;
    estimatedMonthlySavings: number;
  };

  @ApiProperty({ description: 'Range information' })
  ranges: {
    unitsRange: { min: number; max: number };
    billRange: { min: number; max: number };
    qualificationRange: { min: number; max: number };
  };

  @ApiProperty({ description: 'Data quality metrics' })
  dataQuality: {
    withEmail: number;
    withCoordinates: number;
    highQualityData: number;
    enrichmentCoverage: {
      emailLookup: number;
      geocoding: number;
      propertyDetails: number;
    };
  };

  @ApiProperty({ description: 'Potential business value' })
  businessMetrics: {
    highConsumers: number;
    potentialLeads: number;
    estimatedTotalSavingsPotential: number;
    averageSystemSize: number;
    conversionRate: number;
  };
}
