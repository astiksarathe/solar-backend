import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

@Schema({ timestamps: true, collection: 'reminders' })
export class Reminder {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: [
      'follow_up_call',
      'follow_up_meeting',
      'site_visit',
      'proposal_follow_up',
      'payment_reminder',
      'installation_reminder',
      'document_collection',
      'warranty_expiry',
      'maintenance_due',
      'general',
    ],
    index: true,
  })
  type: string;

  @Prop({
    required: true,
    enum: ['pending', 'completed', 'dismissed', 'snoozed'],
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
  dueDate: Date;

  @Prop({ type: Date, index: true })
  completedDate?: Date;

  @Prop({ type: Date })
  snoozeUntil?: Date;

  // Related entities
  @Prop({ type: Types.ObjectId, ref: 'ConsumerDatum', index: true })
  consumerId?: Types.ObjectId;

  @Prop()
  consumerNumber?: string;

  @Prop({ type: Types.ObjectId, ref: 'Lead', index: true })
  leadId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Order', index: true })
  orderId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'ConsumerHistory', index: true })
  historyId?: Types.ObjectId;

  // Assignment
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  // Notification settings
  @Prop({ default: false })
  emailNotification: boolean;

  @Prop({ default: false })
  smsNotification: boolean;

  @Prop({ default: true })
  inAppNotification: boolean;

  @Prop()
  notificationSentAt?: Date;

  // Recurrence (for recurring reminders)
  @Prop({ default: false })
  isRecurring: boolean;

  @Prop({
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
  })
  recurrencePattern?: string;

  @Prop()
  recurrenceEndDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Reminder' })
  parentReminderId?: Types.ObjectId; // For recurring reminders

  // Additional data
  @Prop()
  notes?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  // Action buttons/links
  @Prop()
  actionUrl?: string;

  @Prop()
  actionLabel?: string;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// Indexes for better performance
ReminderSchema.index({ assignedTo: 1, status: 1 });
ReminderSchema.index({ dueDate: 1, status: 1 });
ReminderSchema.index({ type: 1, status: 1 });
ReminderSchema.index({ priority: 1, dueDate: 1 });
ReminderSchema.index({ consumerId: 1 });
ReminderSchema.index({ leadId: 1 });
ReminderSchema.index({ orderId: 1 });
ReminderSchema.index({ isRecurring: 1, recurrencePattern: 1 });

// Pre-save middleware for auto-setting completion date
ReminderSchema.pre('save', function (next) {
  if (this.status === 'completed' && !this.completedDate) {
    this.completedDate = new Date();
  }
  next();
});
