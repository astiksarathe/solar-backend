import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type OrderDocument = Order & Document;

@Schema({ timestamps: true, collection: 'orders' })
export class Order {
  @Prop({ required: true, unique: true, index: true })
  orderNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'ConsumerDatum',
    required: true,
    index: true,
  })
  consumerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Lead',
    required: true,
    index: true,
  })
  leadId: Types.ObjectId;

  @Prop({ required: true })
  consumerNumber: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  phoneNumber: string;

  @Prop()
  emailAddress?: string;

  @Prop({ required: true })
  installationAddress: string;

  @Prop()
  billingAddress?: string;

  @Prop({
    required: true,
    enum: [
      'draft',
      'pending_approval',
      'confirmed',
      'in_progress',
      'installation_scheduled',
      'installation_in_progress',
      'installation_completed',
      'commissioning',
      'completed',
      'cancelled',
      'on_hold',
    ],
    default: 'draft',
    index: true,
  })
  status: string;

  @Prop({
    enum: ['residential', 'commercial', 'industrial'],
    required: true,
    index: true,
  })
  customerType: string;

  // System Details
  @Prop({ required: true })
  systemSize: string; // e.g., "5kW", "10kW"

  @Prop({ required: true })
  systemCapacity: number; // in watts

  @Prop({ required: true })
  numberOfPanels: number;

  @Prop({ required: true })
  panelWattage: number; // per panel

  @Prop()
  inverterType?: string;

  @Prop()
  inverterCapacity?: number;

  @Prop()
  batteryIncluded?: boolean;

  @Prop()
  batteryCapacity?: number; // in kWh

  // Cost Breakdown
  @Prop({
    type: {
      subtotal: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number, default: 0 },
      total: { type: Number, required: true },
      advancePayment: { type: Number, default: 0 },
      remainingAmount: { type: Number, required: true },
    },
    required: true,
  })
  pricing: {
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    advancePayment: number;
    remainingAmount: number;
  };

  // Detailed Cost Items
  @Prop({
    type: [
      {
        category: {
          type: String,
          required: true,
          enum: ['panels', 'inverter', 'battery', 'installation', 'accessories', 'other'],
        },
        itemName: { type: String, required: true },
        description: String,
        quantity: { type: Number, required: true },
        unitPrice: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        taxRate: { type: Number, default: 0 },
        discountAmount: { type: Number, default: 0 },
      },
    ],
    required: true,
  })
  costBreakdown: Array<{
    category: 'panels' | 'inverter' | 'battery' | 'installation' | 'accessories' | 'other';
    itemName: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    taxRate: number;
    discountAmount: number;
  }>;

  // Payment Details
  @Prop({
    type: [
      {
        paymentDate: { type: Date, required: true },
        amount: { type: Number, required: true },
        paymentMethod: {
          type: String,
          enum: ['cash', 'bank_transfer', 'cheque', 'online', 'card'],
          required: true,
        },
        transactionId: String,
        status: {
          type: String,
          enum: ['pending', 'completed', 'failed', 'refunded'],
          default: 'pending',
        },
        notes: String,
      },
    ],
  })
  payments?: Array<{
    paymentDate: Date;
    amount: number;
    paymentMethod: 'cash' | 'bank_transfer' | 'cheque' | 'online' | 'card';
    transactionId?: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    notes?: string;
  }>;

  // Installation Details
  @Prop()
  estimatedInstallationDate?: Date;

  @Prop()
  actualInstallationDate?: Date;

  @Prop()
  installationCompletionDate?: Date;

  @Prop()
  commissioningDate?: Date;

  @Prop()
  warrantyStartDate?: Date;

  @Prop()
  warrantyEndDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  installationTeamLead?: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  installationTeam?: Types.ObjectId[];

  // Documents and Approvals
  @Prop({
    type: [
      {
        documentType: {
          type: String,
          enum: [
            'site_survey',
            'electrical_drawing',
            'structural_drawing',
            'permit_application',
            'permit_approval',
            'interconnection_agreement',
            'installation_photos',
            'commissioning_report',
            'completion_certificate',
            'warranty_documents',
          ],
        },
        fileName: String,
        filePath: String,
        uploadDate: { type: Date, default: Date.now },
        uploadedBy: { type: Types.ObjectId, ref: 'User' },
      },
    ],
  })
  documents?: Array<{
    documentType: string;
    fileName: string;
    filePath: string;
    uploadDate: Date;
    uploadedBy: Types.ObjectId;
  }>;

  // Performance Estimates
  @Prop()
  estimatedAnnualGeneration?: number; // in kWh

  @Prop()
  estimatedMonthlySavings?: number;

  @Prop()
  estimatedAnnualSavings?: number;

  @Prop()
  paybackPeriod?: number; // in years

  // Assignment and Tracking
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

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  // Order Dates
  @Prop({ type: Date, required: true })
  orderDate: Date;

  @Prop({ type: Date })
  approvalDate?: Date;

  @Prop({ type: Date })
  expectedCompletionDate?: Date;

  @Prop({ type: Date })
  actualCompletionDate?: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

// Indexes for better performance
OrderSchema.index({ orderNumber: 1 });
OrderSchema.index({ consumerId: 1 });
OrderSchema.index({ leadId: 1 });
OrderSchema.index({ status: 1, orderDate: -1 });
OrderSchema.index({ assignedTo: 1, status: 1 });
OrderSchema.index({ customerType: 1, status: 1 });
OrderSchema.index({ estimatedInstallationDate: 1 });
OrderSchema.index({ 'pricing.total': 1 });

// Pre-save middleware to calculate totals
OrderSchema.pre('save', function (next) {
  if (this.costBreakdown && this.costBreakdown.length > 0) {
    const subtotal = this.costBreakdown.reduce((sum, item) => {
      const itemTotal = item.totalPrice - (item.discountAmount || 0);
      return sum + itemTotal;
    }, 0);

    const totalTax = this.costBreakdown.reduce((sum, item) => {
      const taxableAmount = item.totalPrice - (item.discountAmount || 0);
      return sum + (taxableAmount * (item.taxRate || 0)) / 100;
    }, 0);

    this.pricing.subtotal = subtotal;
    this.pricing.tax = totalTax;
    this.pricing.total = subtotal + totalTax;
    this.pricing.remainingAmount = this.pricing.total - (this.pricing.advancePayment || 0);
  }
  next();
});
