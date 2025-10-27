import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true, collection: 'reminders' })
export class Reminder {
  @Prop({ required: true, trim: true, maxlength: 200 })
  title: string;

  @Prop({ trim: true, maxlength: 1000 })
  description?: string;

  @Prop({
    enum: [
      'whatsapp',
      'email',
      'meeting',
      'site_visit',
      'proposal_followup',
      'document_collection',
      'installation_schedule',
      'payment_followup',
      'survey',
      'delivery',
      'maintenance',
      'other',
    ],
    index: true,
  })
  type: string;

  @Prop({
    required: true,
    enum: [
      'pending',
      'completed',
      'cancelled',
      'rescheduled',
      'in_progress',
      'overdue',
    ],
    default: 'pending',
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

  @Prop({ type: Date, required: true, index: true })
  scheduledAt: Date;

  @Prop({ type: Date, index: true })
  completedAt?: Date;

  @Prop({ trim: true, maxlength: 1000 })
  completionNotes?: string;

  @Prop({ default: false, index: true })
  isCritical: boolean;

  // Related entities using dynamic references
  @Prop({
    type: Types.ObjectId,
    required: false,
    refPath: 'entityModel',
    index: true,
  })
  entityId?: Types.ObjectId;

  @Prop({
    enum: ['ConsumerData', 'Order'],
    index: true,
  })
  entityModel?: string;

  // Backward compatibility fields
  @Prop({ type: Types.ObjectId, ref: 'ConsumerData', index: true })
  relatedConsumerId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
  relatedOrderId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ConsumerHistory', index: true })
  relatedHistoryId?: Types.ObjectId;

  // Assignment
  @Prop({ required: true, index: true })
  assignedTo: string;

  @Prop({
    enum: ['sales', 'technical', 'installation', 'admin', 'management'],
    index: true,
  })
  department?: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop()
  updatedBy?: string;

  @Prop()
  completedBy?: string;

  // Notification settings
  @Prop({
    type: {
      email: { type: Boolean, default: false },
      sms: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      push: { type: Boolean, default: true },
    },
    default: {},
  })
  notifications?: {
    email?: boolean;
    sms?: boolean;
    whatsapp?: boolean;
    push?: boolean;
  };

  @Prop({ type: [Number], default: [60, 15] })
  notificationIntervals: number[];

  @Prop({ default: false })
  notificationSent: boolean;

  // Recurrence (for recurring reminders)
  @Prop({ default: false, index: true })
  isRecurring: boolean;

  @Prop({
    type: {
      frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
      },
      interval: { type: Number, min: 1, default: 1 },
      endDate: { type: Date },
      maxOccurrences: { type: Number, min: 1 },
      daysOfWeek: { type: [Number] },
      dayOfMonth: { type: Number, min: 1, max: 31 },
    },
  })
  recurringPattern?: {
    frequency?: string;
    interval?: number;
    endDate?: Date;
    maxOccurrences?: number;
    daysOfWeek?: number[];
    dayOfMonth?: number;
  };

  @Prop({ type: Types.ObjectId, ref: 'Reminder' })
  parentReminderId?: Types.ObjectId;

  // Additional data
  @Prop({ trim: true, maxlength: 1000 })
  notes?: string;

  @Prop({ type: [String], default: [], index: true })
  tags: string[];

  @Prop({ type: Object, default: {} })
  customFields?: Record<string, any>;

  // Duration tracking
  @Prop({ min: 5, max: 600 })
  expectedDuration?: number;

  @Prop({ min: 0 })
  actualDuration?: number;

  // Rescheduling
  @Prop()
  originalScheduledAt?: Date;

  @Prop()
  rescheduledFrom?: Date;

  @Prop({ trim: true, maxlength: 500 })
  rescheduleReason?: string;

  @Prop({ default: 0, min: 0 })
  rescheduleCount: number;

  // External integrations
  @Prop({ trim: true })
  externalCalendarEventId?: string;

  // Weather dependency
  @Prop({ default: false })
  weatherDependent: boolean;

  // Quality assurance
  @Prop({ min: 1, max: 5 })
  qualityRating?: number;

  @Prop({
    type: {
      rating: { type: Number, min: 1, max: 5 },
      comments: { type: String, trim: true, maxlength: 500 },
    },
  })
  customerFeedback?: {
    rating?: number;
    comments?: string;
  };
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// Indexes for better performance
ReminderSchema.index({ assignedTo: 1, status: 1 });
ReminderSchema.index({ scheduledAt: 1, status: 1 });
ReminderSchema.index({ type: 1, status: 1 });
ReminderSchema.index({ priority: 1, scheduledAt: 1 });
ReminderSchema.index({ entityId: 1, entityModel: 1 });
ReminderSchema.index({ relatedConsumerId: 1 });
ReminderSchema.index({ relatedOrderId: 1 });
ReminderSchema.index({ isRecurring: 1, 'recurringPattern.frequency': 1 });

// Pre-save middleware for auto-setting completion date and status updates
ReminderSchema.pre('save', function (next) {
  // Auto-set completion date when status changes to completed
  if (this.status === 'completed' && !this.completedAt) {
    this.completedAt = new Date();
  }

  // Auto-mark as overdue if past scheduled time and still pending
  if (this.status === 'pending' && this.scheduledAt < new Date()) {
    this.status = 'overdue';
  }

  // Auto-increment reschedule count when rescheduled
  if (this.status === 'rescheduled' && this.isModified('scheduledAt')) {
    this.rescheduleCount += 1;
    this.rescheduledFrom = this.originalScheduledAt || this.scheduledAt;
  }

  // Set appropriate tags based on priority and type
  if (!this.tags) this.tags = [];

  // Add priority tag
  if (this.priority === 'urgent' && !this.tags.includes('urgent')) {
    this.tags.push('urgent');
  }

  // Add overdue tag
  if (this.status === 'overdue' && !this.tags.includes('overdue')) {
    this.tags.push('overdue');
  }

  // Add type-specific tags
  if (this.type === 'site_visit' && !this.tags.includes('field-work')) {
    this.tags.push('field-work');
  }

  next();
});
