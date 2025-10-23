import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsumerHistoryDocument = ConsumerHistory & Document;

@Schema({ timestamps: true })
export class ConsumerHistory {
  @Prop({ type: Types.ObjectId, ref: 'ConsumerDatum', required: true })
  consumerId: Types.ObjectId;

  @Prop({ required: true })
  consumerNumber: string;

  @Prop({
    required: true,
    enum: [
      'call',
      'meeting',
      'site_visit',
      'email',
      'whatsapp',
      'follow_up',
      'quote_sent',
      'proposal_sent',
      'survey',
      'installation_visit',
      'maintenance',
      'complaint',
      'payment_follow_up',
    ],
  })
  interactionType: string;

  @Prop({
    enum: ['pending', 'completed', 'cancelled', 'rescheduled'],
    default: 'pending',
  })
  status: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop()
  notes?: string;

  @Prop({ required: true })
  scheduledDate: Date;

  @Prop()
  completedDate?: Date;

  @Prop()
  duration?: number;

  @Prop()
  location?: string;

  @Prop()
  contactPerson?: string;

  @Prop()
  phoneNumber?: string;

  @Prop()
  emailAddress?: string;

  @Prop({
    enum: [
      'not_interested',
      'low_interest',
      'interested',
      'very_interested',
      'ready_to_buy',
      'needs_time',
      'price_negotiation',
      'comparing_options',
      'budget_constraints',
    ],
  })
  interestLevel?: string;

  @Prop()
  nextFollowUp?: Date;

  @Prop()
  estimatedBudget?: number;

  @Prop()
  systemSize?: string;

  @Prop([String])
  attachments?: string[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedTo: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  updatedBy?: Types.ObjectId;

  @Prop({ type: Object })
  customFields?: Record<string, any>;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  })
  priority?: string;

  @Prop({
    enum: [
      'successful',
      'needs_follow_up',
      'rejected',
      'postponed',
      'converted',
      'no_response',
      'information_gathering',
    ],
  })
  outcome?: string;

  @Prop([String])
  tags?: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const ConsumerHistorySchema =
  SchemaFactory.createForClass(ConsumerHistory);
