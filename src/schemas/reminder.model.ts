import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

// ===================
// 🔹 SUB-SCHEMAS
// ===================

// --- Location ---
@Schema({ _id: false })
class Location {
  @Prop({ required: false })
  address?: string;

  @Prop({ required: false })
  city?: string;

  @Prop({ required: false })
  state?: string;

  @Prop({ required: false })
  pincode?: string;

  @Prop({ type: { type: String, enum: ['Point'], default: 'Point' } })
  type?: string;

  @Prop({
    type: [Number], // [longitude, latitude]
    index: '2dsphere',
    required: false,
  })
  coordinates?: number[];
}
const LocationSchema = SchemaFactory.createForClass(Location);

// --- Communication History ---
@Schema({ _id: false })
class CommunicationEntry {
  @Prop({
    enum: ['call', 'whatsapp', 'sms', 'email', 'in_person', 'other'],
    default: 'call',
  })
  type: string;

  @Prop()
  content?: string;

  @Prop()
  by?: string;

  @Prop()
  timestamp?: Date;

  @Prop()
  outcome?: string;
}
const CommunicationHistorySchema = [
  SchemaFactory.createForClass(CommunicationEntry),
];

// --- Recurring Pattern ---
@Schema({ _id: false })
class RecurringPattern {
  @Prop({ type: Boolean, default: false })
  enabled: boolean;

  @Prop({ enum: ['daily', 'weekly', 'monthly', 'custom'], default: 'custom' })
  type: string;

  @Prop({ type: [Number], default: [] })
  daysOfWeek?: number[];

  @Prop({ type: Number, default: 0 })
  repeatInterval?: number; // every X days/weeks/months

  @Prop({ type: Number, default: 0 })
  maxOccurrences?: number;

  @Prop()
  endDate?: Date;
}
const RecurringPatternSchema = SchemaFactory.createForClass(RecurringPattern);

// --- Reminder Cost ---
@Schema({ _id: false })
class ReminderCost {
  @Prop({ default: 0 })
  estimatedCost?: number;

  @Prop({ default: 0 })
  actualCost?: number;

  @Prop()
  currency?: string;

  @Prop({ default: 0 })
  discount?: number;

  @Prop({ default: 0 })
  totalCost?: number;
}
const ReminderCostSchema = SchemaFactory.createForClass(ReminderCost);

// ===================
// 🔸 MAIN SCHEMA
// ===================

@Schema({ timestamps: true })
export class Reminder {
  _id: Types.ObjectId;

  // --- Basic Info ---
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    refPath: 'entityModel',
    required: true,
  })
  entityId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['SolarProject', 'Lead', 'Customer', 'User', 'Task'],
  })
  entityModel: string;

  // --- Reminder Type & Status ---
  @Prop({
    enum: [
      'follow_up',
      'installation',
      'payment',
      'loan',
      'net_metering',
      'subsidy',
      'maintenance',
      'other',
    ],
    default: 'follow_up',
  })
  type: string;

  @Prop({
    enum: ['pending', 'completed', 'overdue', 'cancelled', 'rescheduled'],
    default: 'pending',
  })
  status: string;

  // --- Assigned User ---
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId;

  @Prop()
  createdBy?: Types.ObjectId;

  // --- Timing ---
  @Prop({ required: true })
  scheduledAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  rescheduledAt?: Date;

  @Prop({ default: 0 })
  rescheduleCount?: number;

  // --- Location ---
  @Prop({ type: LocationSchema })
  location?: Location;

  // --- Communications ---
  @Prop({ type: CommunicationHistorySchema, default: [] })
  communicationHistory?: CommunicationEntry[];

  // --- Recurring Pattern ---
  @Prop({ type: RecurringPatternSchema })
  recurringPattern?: RecurringPattern;

  // --- Cost Details ---
  @Prop({ type: ReminderCostSchema })
  cost?: ReminderCost;

  // --- Custom Tags ---
  @Prop({ type: [String], default: [] })
  tags?: string[];

  // --- Notes & Attachments ---
  @Prop({ type: [String], default: [] })
  documents?: string[];

  @Prop()
  remarks?: string;

  // --- Notification Tracking ---
  @Prop({
    type: [
      {
        channel: {
          type: String,
          enum: ['sms', 'email', 'push', 'whatsapp', 'in_app'],
          default: 'sms',
        },
        sentAt: Date,
        status: {
          type: String,
          enum: ['sent', 'failed', 'queued'],
          default: 'queued',
        },
        messageId: String,
        errorMessage: String,
      },
    ],
    default: [],
  })
  notificationHistory?: Record<string, any>[];

  // --- Weather / External Info ---
  @Prop({ type: Object })
  weatherInfo?: Record<string, any>;

  // --- Feedback & Quality ---
  @Prop({
    type: [
      {
        feedbackBy: { type: MongooseSchema.Types.ObjectId, ref: 'User' },
        rating: { type: Number, min: 1, max: 5 },
        comments: String,
      },
    ],
    default: [],
  })
  feedback?: Record<string, any>[];

  // --- Audit ---
  @Prop({ type: Date, default: Date.now })
  lastModified?: Date;

  @Prop({ default: true })
  isActive?: boolean;

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;
}

export type ReminderDocument = Reminder & Document;
export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// ===================
// 🔸 INDEXES & HOOKS
// ===================

// Basic indexes for search and filter
ReminderSchema.index({ assignedTo: 1 });
ReminderSchema.index({ scheduledAt: 1 });
ReminderSchema.index({ status: 1 });
ReminderSchema.index({ entityModel: 1, entityId: 1 });
ReminderSchema.index({ title: 'text', description: 'text' });

// Pre-save: mark overdue reminders
ReminderSchema.pre('save', function (next) {
  if (this.status === 'pending' && this.scheduledAt < new Date()) {
    this.status = 'overdue';
  }
  if (this.isModified('status')) {
    this.lastModified = new Date();
  }
  next();
});

// Virtual: check if reminder is overdue
ReminderSchema.virtual('isOverdue').get(function (this: ReminderDocument) {
  return this.status === 'pending' && this.scheduledAt < new Date();
});
