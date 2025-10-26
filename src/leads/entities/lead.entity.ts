import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LeadDocument = Lead & Document;

@Schema({ timestamps: true, collection: 'leads' })
export class Lead {
  @Prop({
    type: Types.ObjectId,
    ref: 'ConsumerDatum',
    required: false,
    index: true,
  })
  consumerId?: Types.ObjectId;

  @Prop({ required: false, sparse: true, index: true })
  consumerNumber?: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  emailAddress?: string;

  @Prop({ required: true })
  address: string;

  @Prop({
    type: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
  })
  location?: {
    latitude: number;
    longitude: number;
  };

  @Prop({
    required: true,
    enum: [
      'new',
      'contacted',
      'qualified',
      'proposal_sent',
      'negotiation',
      'closed_won',
      'closed_lost',
    ],
    default: 'new',
    index: true,
  })
  status: string;

  @Prop({
    required: true,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true,
  })
  priority: string;

  @Prop({
    enum: [
      'not_interested',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
    ],
    default: 'interested',
    index: true,
  })
  interestLevel: string;

  @Prop()
  estimatedBudget?: number;

  @Prop()
  systemSize?: string; // e.g., "5kW", "10kW"

  @Prop()
  rooftopArea?: number; // in sq ft

  @Prop()
  monthlyElectricityBill?: number;

  @Prop()
  averageMonthlyUnits?: number;

  @Prop({
    enum: ['residential', 'commercial', 'industrial'],
    default: 'residential',
    index: true,
  })
  customerType: string;

  @Prop({ type: Date, index: true })
  expectedClosingDate?: Date;

  @Prop({ type: Date, index: true })
  lastContactDate?: Date;

  @Prop({ type: Date, index: true })
  nextFollowUpDate?: Date;

  @Prop()
  leadSource?: string; // e.g., 'website', 'referral', 'cold_call', 'exhibition'

  @Prop({
    enum: [
      'consumer_data',
      'direct_inquiry',
      'marketing',
      'referral',
      'cold_call',
      'trade_show',
      'walk_in',
      'self',
    ],
    default: 'self',
    required: true,
    index: true,
  })
  leadType: string; // Distinguishes between leads from consumer data vs direct leads

  @Prop()
  referredBy?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({
    type: {
      systemSize: { type: String, required: true },
      estimatedCost: { type: Number, required: true },
      paybackPeriod: { type: Number, required: true },
      annualSavings: { type: Number, required: true },
      proposalDate: { type: Date, required: true },
      validUntil: { type: Date, required: true },
    },
  })
  proposalDetails?: {
    systemSize: string;
    estimatedCost: number;
    paybackPeriod: number;
    annualSavings: number;
    proposalDate: Date;
    validUntil: Date;
  };

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop({ type: Date })
  convertedToOrderDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Order' })
  orderId?: Types.ObjectId;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);

// Indexes for better performance
LeadSchema.index({ consumerId: 1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ status: 1, priority: 1 });
LeadSchema.index({ nextFollowUpDate: 1 });
LeadSchema.index({ customerType: 1, status: 1 });
LeadSchema.index({ createdAt: -1 });
