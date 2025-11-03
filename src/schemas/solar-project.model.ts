import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SolarProjectDocument = SolarProject & Document;

@Schema({ timestamps: true, collection: 'solar_projects' })
export class SolarProject {
  // === BASIC INFO ===
  @Prop({ trim: true })
  name: string;

  @Prop({ unique: true, trim: true, uppercase: true })
  consumerNumber: string;

  @Prop({ required: true })
  address: string;

  @Prop({ trim: true })
  divisionName: string;

  @Prop({ trim: true })
  mobileNumber: string;

  @Prop({ trim: true })
  purpose?: string;

  // === USAGE DATA ===
  @Prop({ type: [Number], default: [] })
  amount: number[];

  @Prop({ type: [Number], default: [] })
  units: number[];

  @Prop({ min: 0 })
  avgUnits?: number;

  @Prop({ min: 0 })
  avgMonthlyBill?: number;

  // === CLASSIFICATION ===
  @Prop({
    enum: [
      'residential',
      'commercial',
      'agricultural',
      'industrial',
      'unknown',
    ],
    default: 'unknown',
  })
  propertyType: string;

  // === PROJECT STATUS FLOW ===
  @Prop({
    enum: [
      // Lead / Pre-sales
      'new',
      'contacted',
      'proposal_sent',
      'proposal_accepted',

      // Execution / Project stages
      'loan_processing',
      'net_metering',
      'installation',
      'subsidy_processing',
      'commissioned',
      'closed',

      // Negative / Non-conversion
      'not_interested',
      'invalid_number',
      'duplicate',
      'unreachable',
      'lost',
    ],
    default: 'new',
    index: true,
  })
  status: string;

  @Prop({ default: false })
  isConverted: boolean;

  // === ASSIGNMENT & META ===
  @Prop({ type: Types.ObjectId, ref: 'User' })
  assignedTo?: Types.ObjectId;

  @Prop({ type: [String], default: [] })
  tags: string[];

  // === PROPOSALS ===
  @Prop({
    type: [
      {
        version: Number,
        status: {
          type: String,
          enum: ['draft', 'sent', 'accepted', 'rejected', 'expired'],
          default: 'draft',
        },
        solarKw: Number,
        estimatedCost: Number,
        financingOption: { type: String, enum: ['loan', 'cash', 'lease'] },
        proposalDate: Date,
        notes: String,
      },
    ],
    default: [],
  })
  proposals: {
    version: number;
    status: string;
    solarKw?: number;
    estimatedCost?: number;
    financingOption?: string;
    proposalDate?: Date;
    notes?: string;
  }[];

  // === TIMELINE ===
  @Prop({
    type: [
      {
        date: { type: Date, default: Date.now },
        type: {
          type: String,
          enum: [
            'status_change',
            'note',
            'record_add',
            'reminder',
            'follow_up',
            'proposal_update',
            'loan_update',
            'installation_update',
            'net_metering_update',
            'subsidy_update',
          ],
        },
        message: String,
        oldStatus: String,
        newStatus: String,
        relatedId: { type: Types.ObjectId },
        userId: { type: Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
  })
  timeline: {
    date: Date;
    type: string;
    message?: string;
    oldStatus?: string;
    newStatus?: string;
    relatedId?: Types.ObjectId;
    userId?: Types.ObjectId;
  }[];

  // === OPTIONAL GEO INFO ===
  @Prop({ type: Object })
  parsedAddress?: {
    district?: string;
    state?: string;
    pincode?: string;
    coordinates?: { latitude: number; longitude: number };
  };

  createdAt?: Date;
  updatedAt?: Date;
}

export const SolarProjectSchema = SchemaFactory.createForClass(SolarProject);

//
// === INDEXES ===
//
SolarProjectSchema.index({ consumerNumber: 1 }, { unique: true });
SolarProjectSchema.index({ mobileNumber: 1 });
SolarProjectSchema.index({ status: 1 });
SolarProjectSchema.index({ assignedTo: 1, status: 1 });
SolarProjectSchema.index({ createdAt: -1 });
SolarProjectSchema.index({ tags: 1 });
SolarProjectSchema.index(
  {
    name: 'text',
    address: 'text',
    consumerNumber: 'text',
  },
  {
    name: 'solar_project_search_index',
  },
);


SolarProjectSchema.pre('save', function (next) {
  // Derive property type from purpose if not set or unknown
  if (!this.propertyType || this.propertyType === 'unknown') {
    const purpose = (this.purpose || '').toLowerCase();
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

  // Auto-add a timeline entry when status changes
  if (this.isModified('status')) {
    if (!this.timeline) this.timeline = [];
    const oldStatus = this.modifiedPaths().includes('status')
      ? this.get('status', null, { getters: false })
      : undefined;

    this.timeline.push({
      date: new Date(),
      type: 'status_change',
      message: `Status changed to ${this.status}`,
      oldStatus: oldStatus,
      newStatus: this.status,
    });
  }
  console.log('Pre-save middleware executed for solar project:', this);
  next();
});

//
// === POST-SAVE MIDDLEWARE ===
//
SolarProjectSchema.post('save', function (doc) {
  console.log(
    `Solar project saved: ${doc.consumerNumber} - ${doc.name} [${doc.status}]`,
  );
});
