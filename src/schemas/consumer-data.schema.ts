import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConsumerDataDocument = ConsumerData & Document;

/**
 * ConsumerData Schema
 *
 * This collection stores all the scraped data from electricity board portals.
 * This is the primary source of potential customers for solar installations.
 * Each document represents a consumer with their electricity consumption patterns.
 */
@Schema({
  timestamps: true,
  collection: 'consumer_data',
})
export class ConsumerData {
  // === SCRAPED DATA FROM ELECTRICITY BOARD ===

  /** Consumer's full name as registered with electricity board */
  @Prop({ required: true, trim: true, index: true })
  name: string;

  /** Unique consumer number from electricity board (primary identifier) */
  @Prop({ required: true, unique: true, trim: true, uppercase: true })
  consumerNumber: string;

  /** Full address as registered with electricity board */
  @Prop({ required: true, trim: true })
  address: string;

  /** Administrative division/circle name from electricity board */
  @Prop({ required: true, trim: true, index: true })
  divisionName: string;

  /** Mobile number registered with electricity board */
  @Prop({ required: true, trim: true, index: true })
  mobileNumber: string;

  /** Connection type/purpose (e.g., "Permanent agricultural pump", "Domestic") */
  @Prop({ required: true, trim: true })
  purpose: string;

  /** Array of last 12 months' bill amounts in rupees (latest first) */
  @Prop({
    type: [Number],
    required: true,
    validate: [arrayLimit, '{PATH} must have 12 elements'],
  })
  amount: number[];

  /** Array of last 12 months' unit consumption (latest first) */
  @Prop({
    type: [Number],
    required: true,
    validate: [arrayLimit, '{PATH} must have 12 elements'],
  })
  last6MonthsUnits: number[]; // Note: Actually stores 12 months despite the name

  /** Average monthly units calculated from consumption data */
  @Prop({ required: true, min: 0, index: true })
  avgUnits: number;

  // === COMPUTED/ENRICHED FIELDS ===

  /** Email address (enriched from external sources or manual entry) */
  @Prop({ trim: true, lowercase: true, sparse: true })
  email?: string;

  /** Property type derived from purpose field */
  @Prop({
    enum: [
      'residential',
      'commercial',
      'agricultural',
      'industrial',
      'unknown',
    ],
    default: 'unknown',
    index: true,
  })
  propertyType: string;

  /** Average monthly bill amount calculated from amount array */
  @Prop({ min: 0 })
  avgMonthlyBill: number;

  /** Electricity provider/board name derived from division */
  @Prop({ trim: true })
  electricityProvider?: string;

  /** Connection billing type derived from purpose */
  @Prop({
    enum: ['flat_rate', 'metered', 'subsidized', 'commercial_rate', 'unknown'],
    default: 'unknown',
  })
  connectionType: string;

  /** Flag indicating if this is a high consumption customer (good solar candidate) */
  @Prop({ default: false, index: true })
  isHighConsumer: boolean;

  // === PROCESSING STATUS ===

  /** Source of this data record */
  @Prop({
    enum: ['scraped', 'manual', 'imported', 'api'],
    default: 'scraped',
    required: true,
  })
  source: string;

  /** Current processing status of this consumer */
  @Prop({
    enum: [
      'new',
      'contacted',
      'interested',
      'not_interested',
      'converted',
      'invalid',
    ],
    default: 'new',
    required: true,
    index: true,
  })
  status: string;

  /** Whether this consumer has been converted to an active customer */
  @Prop({ default: false, index: true })
  isConverted: boolean;

  /** AI/ML calculated score for customer qualification (0-100) */
  @Prop({ min: 0, max: 100, index: true })
  qualificationScore?: number;

  /** Manual notes added by sales team */
  @Prop({ type: [String], default: [] })
  notes: string[];

  // === SCRAPING METADATA ===

  /** Metadata about the scraping process */
  @Prop({
    type: {
      sourceUrl: { type: String }, // URL from where data was scraped
      scrapedAt: { type: Date, default: Date.now }, // When was this data scraped
      batchId: { type: String }, // Batch identifier for bulk scraping
      dataQuality: {
        type: String,
        enum: ['complete', 'partial', 'poor'],
        default: 'complete',
      },
    },
  })
  scrapingMetadata?: {
    sourceUrl?: string;
    scrapedAt?: Date;
    batchId?: string;
    dataQuality?: string;
  };

  // === DATA ENRICHMENT TRACKING ===

  /** Track which enrichment processes have been attempted */
  @Prop({
    type: {
      emailLookup: { type: Boolean, default: false }, // Attempted email discovery
      addressGeocoding: { type: Boolean, default: false }, // Attempted address to coordinates
      propertyDetails: { type: Boolean, default: false }, // Attempted property info lookup
      roofAnalysis: { type: Boolean, default: false }, // Attempted satellite roof analysis
    },
    default: {},
  })
  enrichmentAttempts?: {
    emailLookup?: boolean;
    addressGeocoding?: boolean;
    propertyDetails?: boolean;
    roofAnalysis?: boolean;
  };

  // === COMPUTED SOLAR POTENTIAL ===

  /** Estimated solar system capacity in kW (calculated from consumption) */
  @Prop({ min: 0 })
  estimatedSolarCapacity?: number;

  /** Estimated monthly savings with solar in rupees */
  @Prop({ min: 0 })
  estimatedMonthlySavings?: number;

  /** Estimated payback period in months */
  @Prop({ min: 0 })
  estimatedPaybackMonths?: number;

  // === GEOGRAPHIC DATA ===

  /** Parsed and structured address components */
  @Prop({
    type: {
      village: String,
      tehsil: String,
      district: String,
      state: String,
      pincode: String,
      coordinates: {
        type: {
          latitude: Number,
          longitude: Number,
        },
      },
    },
  })
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

  // === CONTACT PREFERENCES ===

  /** Preferred language for communication (derived from name/location) */
  @Prop({
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
    default: 'hindi',
  })
  preferredLanguage?: string;

  /** Best time to contact (derived from customer type) */
  @Prop({
    enum: ['morning', 'afternoon', 'evening', 'any'],
    default: 'any',
  })
  bestContactTime?: string;

  // Timestamps are automatically added by @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

// Validation function for arrays that should have exactly 12 elements
function arrayLimit(val: number[]): boolean {
  return val.length === 12;
}

export const ConsumerDataSchema = SchemaFactory.createForClass(ConsumerData);

// Add indexes after schema creation
ConsumerDataSchema.index({ consumerNumber: 1 }, { unique: true });
ConsumerDataSchema.index({ mobileNumber: 1 });
ConsumerDataSchema.index({ status: 1 });
ConsumerDataSchema.index({ propertyType: 1 });
ConsumerDataSchema.index({ qualificationScore: -1 });
ConsumerDataSchema.index({ avgMonthlyBill: -1 });
ConsumerDataSchema.index({ createdAt: -1 });
ConsumerDataSchema.index(
  {
    name: 'text',
    address: 'text',
    consumerNumber: 'text',
  },
  {
    name: 'consumer_search_index',
  },
);

// === PRE-SAVE MIDDLEWARE ===
// Automatically calculate derived fields before saving

ConsumerDataSchema.pre('save', function (next) {
  // Calculate average monthly bill from amount array
  if (this.amount && this.amount.length > 0) {
    this.avgMonthlyBill =
      this.amount.reduce((sum, amt) => sum + amt, 0) / this.amount.length;
  }

  // Determine if high consumer (good solar candidate)
  this.isHighConsumer = this.avgUnits > 300; // Threshold can be adjusted

  // Calculate qualification score based on various factors
  let score = 0;
  if (this.avgUnits > 500) score += 30;
  if (this.avgMonthlyBill > 3000) score += 25;
  if (this.propertyType === 'agricultural') score += 20;
  if (this.propertyType === 'commercial') score += 15;
  if (this.mobileNumber && this.mobileNumber.length === 10) score += 15;
  if (this.parsedAddress?.coordinates) score += 10;
  if (this.email) score += 5;

  this.qualificationScore = Math.min(score, 100);

  // Derive property type from purpose if not set
  if (!this.propertyType || this.propertyType === 'unknown') {
    const purpose = this.purpose.toLowerCase();
    if (purpose.includes('agricultural') || purpose.includes('pump')) {
      this.propertyType = 'agricultural';
    } else if (purpose.includes('commercial') || purpose.includes('shop')) {
      this.propertyType = 'commercial';
    } else if (
      purpose.includes('domestic') ||
      purpose.includes('residential')
    ) {
      this.propertyType = 'residential';
    } else if (purpose.includes('industrial')) {
      this.propertyType = 'industrial';
    }
  }

  // Derive connection type from purpose
  if (this.purpose.toLowerCase().includes('flat rate')) {
    this.connectionType = 'flat_rate';
  } else if (this.purpose.toLowerCase().includes('metered')) {
    this.connectionType = 'metered';
  }

  // Calculate estimated solar capacity (rule of thumb: 1kW per 150 units/month)
  if (this.avgUnits > 100) {
    this.estimatedSolarCapacity = Math.round((this.avgUnits / 150) * 10) / 10;
  }

  // Calculate estimated monthly savings (assume 80% of current bill can be saved)
  if (this.avgMonthlyBill > 1000) {
    this.estimatedMonthlySavings = Math.round(this.avgMonthlyBill * 0.8);
  }

  // Calculate estimated payback period (assume ₹50,000 per kW system cost)
  if (this.estimatedSolarCapacity && this.estimatedMonthlySavings) {
    const systemCost = this.estimatedSolarCapacity * 50000;
    this.estimatedPaybackMonths = Math.round(
      systemCost / this.estimatedMonthlySavings,
    );
  }

  next();
});

// === POST-SAVE MIDDLEWARE ===
// Log activity after save

ConsumerDataSchema.post('save', function (doc) {
  // Could trigger activity logging here
  console.log(`Consumer data saved: ${doc.consumerNumber} - ${doc.name}`);
});
