import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReminderDocument = Reminder & Document;

/**
 * Reminder Schema - Simplified version for building
 * This collection manages all follow-up activities and reminders across the sales pipeline.
 */
@Schema({
  timestamps: true,
  collection: 'reminders',
})
export class Reminder {
  @Prop({
    type: Types.ObjectId,
    required: true,
    refPath: 'entityModel',
    index: true,
  })
  entityId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['ConsumerData', 'Lead', 'Order'],
    index: true,
  })
  entityModel: string;

  @Prop({
    required: true,
    enum: [
      'call',
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
    index: true,
  })
  scheduledAt: Date;

  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  title: string;

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  description?: string;

  @Prop({
    required: true,
    index: true,
  })
  assignedTo: string;

  @Prop({
    enum: ['sales', 'technical', 'installation', 'admin', 'management'],
    index: true,
  })
  department?: string;

  @Prop({
    enum: [
      'pending',
      'completed',
      'cancelled',
      'rescheduled',
      'in_progress',
      'overdue',
    ],
    required: true,
    default: 'pending',
    index: true,
  })
  status: string;

  @Prop()
  completedAt?: Date;

  @Prop({
    trim: true,
    maxlength: 1000,
  })
  completionNotes?: string;

  @Prop({
    enum: ['low', 'medium', 'high', 'urgent'],
    required: true,
    default: 'medium',
    index: true,
  })
  priority: string;

  @Prop({
    default: false,
    index: true,
  })
  isCritical: boolean;

  @Prop({
    required: true,
  })
  createdBy: string;

  @Prop()
  updatedBy?: string;

  @Prop()
  completedBy?: string;

  createdAt?: Date;
  updatedAt?: Date;
}

export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// Add indexes after schema creation
ReminderSchema.index({ scheduledAt: 1, status: 1 });
ReminderSchema.index({ assignedTo: 1, scheduledAt: 1 });
ReminderSchema.index({ entityId: 1, entityModel: 1 });
ReminderSchema.index({ status: 1, priority: 1 });

// /**
//  * Reminder Schema
//  *
//  * This collection manages all follow-up activities and reminders across the sales pipeline.
//  * Reminders can be linked to consumer data, leads, or orders to ensure no opportunity
//  * is missed and all commitments are tracked.
//  *
//  * Used for: calls, meetings, site visits, proposal follow-ups, installation schedules, etc.
//  */
// @Schema({
//   timestamps: true,
//   collection: 'reminders',
// })
// export class Reminder {
//   // === ENTITY REFERENCE ===

//   /** Reference to the related entity (ConsumerData, Lead, or Order) */
//   @Prop({
//     type: Types.ObjectId,
//     required: true,
//     refPath: 'entityModel',
//     index: true,
//   })
//   entityId: Types.ObjectId;

//   /** Type of entity this reminder is linked to */
//   @Prop({
//     required: true,
//     enum: ['ConsumerData', 'Lead', 'Order'],
//     index: true,
//   })
//   entityModel: string;

//   // === REMINDER DETAILS ===

//   /** Type of reminder/activity */
//   @Prop({
//     required: true,
//     enum: [
//       'call', // Phone call to customer
//       'whatsapp', // WhatsApp message/call
//       'email', // Email follow-up
//       'meeting', // Scheduled meeting
//       'site_visit', // Physical site visit
//       'proposal_followup', // Follow-up on sent proposal
//       'document_collection', // Collect required documents
//       'installation_schedule', // Schedule installation
//       'payment_followup', // Follow-up on pending payments
//       'survey', // Site survey reminder
//       'delivery', // Material delivery
//       'maintenance', // Maintenance visit
//       'other',
//     ],
//     index: true,
//   })
//   type: string;

//   /** When this reminder is scheduled */
//   @Prop({
//     required: true,
//     index: true,
//   })
//   scheduledAt: Date;

//   /** Brief title/subject of the reminder */
//   @Prop({
//     required: true,
//     trim: true,
//     maxlength: 200,
//   })
//   title: string;

//   /** Detailed description of what needs to be done */
//   @Prop({
//     trim: true,
//     maxlength: 1000,
//   })
//   description?: string;

//   // === ASSIGNMENT ===

//   /** Who is responsible for this reminder */
//   @Prop({
//     required: true,
//     index: true,
//   })
//   assignedTo: string;

//   /** Team or department (optional for organization) */
//   @Prop({
//     enum: ['sales', 'technical', 'installation', 'admin', 'management'],
//     index: true,
//   })
//   department?: string;

//   // === STATUS TRACKING ===

//   /** Current status of the reminder */
//   @Prop({
//     enum: [
//       'pending',
//       'completed',
//       'cancelled',
//       'rescheduled',
//       'in_progress',
//       'overdue',
//     ],
//     required: true,
//     default: 'pending',
//     index: true,
//   })
//   status: string;

//   /** When the reminder was completed */
//   @Prop()
//   completedAt?: Date;

//   /** Notes added when completing the reminder */
//   @Prop({
//     trim: true,
//     maxlength: 1000,
//   })
//   completionNotes?: string;

//   /** Outcome of the completed activity */
//   @Prop({
//     enum: [
//       'successful', // Task completed successfully
//       'partial', // Partially completed
//       'failed', // Could not complete
//       'no_response', // Customer didn't respond
//       'rescheduled', // Had to reschedule
//       'cancelled', // Cancelled by customer/us
//     ],
//   })
//   outcome?: string;

//   // === PRIORITY AND URGENCY ===

//   /** Priority level of this reminder */
//   @Prop({
//     enum: ['low', 'medium', 'high', 'urgent'],
//     required: true,
//     default: 'medium',
//     index: true,
//   })
//   priority: string;

//   /** Whether this is a critical reminder */
//   @Prop({
//     default: false,
//     index: true,
//   })
//   isCritical: boolean;

//   // === CONTACT AND LOCATION ===

//   /** Contact details for this specific reminder */
//   @Prop({
//     type: {
//       customerName: { type: String, trim: true },
//       phone: { type: String, trim: true },
//       email: { type: String, trim: true, lowercase: true },
//       alternatePhone: { type: String, trim: true },
//     },
//   })
//   contactDetails?: {
//     customerName?: string;
//     phone?: string;
//     email?: string;
//     alternatePhone?: string;
//   };

//   /** Location details for visits/meetings */
//   @Prop({
//     type: {
//       address: { type: String, trim: true },
//       landmark: { type: String, trim: true },
//       coordinates: {
//         type: {
//           latitude: { type: Number, min: -90, max: 90 },
//           longitude: { type: Number, min: -180, max: 180 },
//         },
//       },
//       instructions: { type: String, trim: true }, // Special instructions for location
//     },
//   })
//   location?: {
//     address?: string;
//     landmark?: string;
//     coordinates?: {
//       latitude: number;
//       longitude: number;
//     };
//     instructions?: string;
//   };

//   // === RESCHEDULING ===

//   /** Original date if this reminder was rescheduled */
//   @Prop()
//   originalScheduledAt?: Date;

//   /** Previous scheduled date if rescheduled multiple times */
//   @Prop()
//   rescheduledFrom?: Date;

//   /** Reason for rescheduling */
//   @Prop({
//     trim: true,
//     maxlength: 500,
//   })
//   rescheduleReason?: string;

//   /** Number of times this reminder has been rescheduled */
//   @Prop({
//     default: 0,
//     min: 0,
//   })
//   rescheduleCount: number;

//   // === RECURRING REMINDERS ===

//   /** Whether this is a recurring reminder */
//   @Prop({
//     default: false,
//     index: true,
//   })
//   isRecurring: boolean;

//   /** Recurring pattern configuration */
//   @Prop({
//     type: {
//       frequency: {
//         type: String,
//         enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'],
//       },
//       interval: { type: Number, min: 1, default: 1 }, // Every X days/weeks/months
//       endDate: { type: Date }, // When to stop recurring
//       maxOccurrences: { type: Number, min: 1 }, // Maximum number of occurrences
//       daysOfWeek: { type: [Number] }, // For weekly: [1,2,3] for Mon,Tue,Wed
//       dayOfMonth: { type: Number, min: 1, max: 31 }, // For monthly: day of month
//     },
//   })
//   recurringPattern?: {
//     frequency?: string;
//     interval?: number;
//     endDate?: Date;
//     maxOccurrences?: number;
//     daysOfWeek?: number[];
//     dayOfMonth?: number;
//   };

//   /** Reference to parent recurring reminder */
//   @Prop({
//     type: Types.ObjectId,
//     ref: 'Reminder',
//   })
//   parentReminderId?: Types.ObjectId;

//   // === AUTOMATION ===

//   /** Whether to send automatic notifications */
//   @Prop({
//     type: {
//       email: { type: Boolean, default: false },
//       sms: { type: Boolean, default: false },
//       whatsapp: { type: Boolean, default: false },
//       push: { type: Boolean, default: true },
//     },
//     default: {},
//   })
//   notifications?: {
//     email?: boolean;
//     sms?: boolean;
//     whatsapp?: boolean;
//     push?: boolean;
//   };

//   /** When to send notification before the scheduled time (in minutes) */
//   @Prop({
//     type: [Number],
//     default: [60, 15], // 1 hour and 15 minutes before
//   })
//   notificationIntervals: number[];

//   /** Whether notification has been sent */
//   @Prop({
//     default: false,
//   })
//   notificationSent: boolean;

//   // === RELATED DATA ===

//   /** Expected duration of the activity (in minutes) */
//   @Prop({
//     min: 5,
//     max: 600, // Maximum 10 hours
//   })
//   expectedDuration?: number;

//   /** Actual duration taken (in minutes) */
//   @Prop({
//     min: 0,
//   })
//   actualDuration?: number;

//   /** Cost associated with this activity */
//   @Prop({
//     type: {
//       travelCost: { type: Number, min: 0 },
//       materialCost: { type: Number, min: 0 },
//       laborCost: { type: Number, min: 0 },
//       totalCost: { type: Number, min: 0 },
//     },
//   })
//   cost?: {
//     travelCost?: number;
//     materialCost?: number;
//     laborCost?: number;
//     totalCost?: number;
//   };

//   // === PREPARATION AND REQUIREMENTS ===

//   /** Items to prepare or bring for this reminder */
//   @Prop({
//     type: [String],
//     default: [],
//   })
//   preparationItems: string[];

//   /** Documents required for this activity */
//   @Prop({
//     type: [
//       {
//         name: { type: String, required: true, trim: true },
//         required: { type: Boolean, default: true },
//         obtained: { type: Boolean, default: false },
//       },
//     ],
//     default: [],
//   })
//   requiredDocuments: Array<{
//     name: string;
//     required: boolean;
//     obtained: boolean;
//   }>;

//   // === FOLLOW-UP ACTIONS ===

//   /** Actions to be taken after completing this reminder */
//   @Prop({
//     type: [
//       {
//         action: { type: String, required: true, trim: true },
//         dueDate: { type: Date },
//         assignedTo: { type: String, trim: true },
//         completed: { type: Boolean, default: false },
//       },
//     ],
//     default: [],
//   })
//   followUpActions: Array<{
//     action: string;
//     dueDate?: Date;
//     assignedTo?: string;
//     completed: boolean;
//   }>;

//   // === INTEGRATION DATA ===

//   /** External calendar event ID (Google Calendar, Outlook, etc.) */
//   @Prop({
//     trim: true,
//   })
//   externalCalendarEventId?: string;

//   /** Integration with external systems */
//   @Prop({
//     type: {
//       calendarSync: { type: Boolean, default: false },
//       crmSync: { type: Boolean, default: false },
//       lastSyncAt: { type: Date },
//     },
//     default: {},
//   })
//   integrations?: {
//     calendarSync?: boolean;
//     crmSync?: boolean;
//     lastSyncAt?: Date;
//   };

//   // === WEATHER CONSIDERATIONS ===

//   /** Whether weather affects this reminder (for outdoor activities) */
//   @Prop({
//     default: false,
//   })
//   weatherDependent: boolean;

//   /** Weather conditions when completed */
//   @Prop({
//     type: {
//       condition: { type: String, trim: true }, // sunny, rainy, cloudy
//       temperature: { type: Number },
//       notes: { type: String, trim: true },
//     },
//   })
//   weatherInfo?: {
//     condition?: string;
//     temperature?: number;
//     notes?: string;
//   };

//   // === QUALITY ASSURANCE ===

//   /** Quality rating for completed reminders (1-5) */
//   @Prop({
//     min: 1,
//     max: 5,
//   })
//   qualityRating?: number;

//   /** Customer feedback on the interaction */
//   @Prop({
//     type: {
//       rating: { type: Number, min: 1, max: 5 },
//       comments: { type: String, trim: true, maxlength: 500 },
//     },
//   })
//   customerFeedback?: {
//     rating?: number;
//     comments?: string;
//   };

//   // === TAGS AND CATEGORIZATION ===

//   /** Tags for easy filtering and categorization */
//   @Prop({
//     type: [String],
//     default: [],
//     index: true,
//   })
//   tags: string[];

//   /** Custom category for business-specific classification */
//   @Prop({
//     trim: true,
//     index: true,
//   })
//   category?: string;

//   // === CUSTOM FIELDS ===

//   /** Flexible storage for custom business-specific fields */
//   @Prop({
//     type: Object,
//     default: {},
//   })
//   customFields?: Record<string, any>;

//   // === AUDIT FIELDS ===

//   /** Who created this reminder */
//   @Prop({
//     required: true,
//   })
//   createdBy: string;

//   /** Who last updated this reminder */
//   @Prop()
//   updatedBy?: string;

//   /** Who completed this reminder */
//   @Prop()
//   completedBy?: string;

//   // Timestamps are automatically added by @Schema({ timestamps: true })
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export const ReminderSchema = SchemaFactory.createForClass(Reminder);

// // === INDEXES FOR PERFORMANCE ===
// ReminderSchema.index({ scheduledAt: 1, status: 1 }); // Dashboard queries
// ReminderSchema.index({ assignedTo: 1, scheduledAt: 1 }); // User's reminders
// ReminderSchema.index({ entityId: 1, entityModel: 1 }); // Entity-specific reminders
// ReminderSchema.index({ status: 1, priority: 1 }); // Priority management
// ReminderSchema.index({ type: 1, scheduledAt: 1 }); // Activity type analysis
// ReminderSchema.index({ department: 1, status: 1 }); // Department workload
// ReminderSchema.index({ isRecurring: 1, scheduledAt: 1 }); // Recurring reminder management

// // === PRE-SAVE MIDDLEWARE ===
// ReminderSchema.pre('save', function (next) {
//   // Auto-mark as overdue if past scheduled time and still pending
//   if (this.status === 'pending' && this.scheduledAt < new Date()) {
//     this.status = 'overdue';
//   }

//   // Calculate total cost if individual costs are provided
//   if (this.cost) {
//     const { travelCost = 0, materialCost = 0, laborCost = 0 } = this.cost;
//     this.cost.totalCost = travelCost + materialCost + laborCost;
//   }

//   // Auto-set completion date when status changes to completed
//   if (this.status === 'completed' && !this.completedAt) {
//     this.completedAt = new Date();
//   }

//   // Auto-increment reschedule count when rescheduled
//   if (this.status === 'rescheduled' && this.isModified('scheduledAt')) {
//     this.rescheduleCount += 1;
//     this.rescheduledFrom = this.originalScheduledAt || this.scheduledAt;
//   }

//   // Set appropriate tags based on priority and type
//   if (!this.tags) this.tags = [];

//   // Add priority tag
//   if (this.priority === 'urgent' && !this.tags.includes('urgent')) {
//     this.tags.push('urgent');
//   }

//   // Add overdue tag
//   if (this.status === 'overdue' && !this.tags.includes('overdue')) {
//     this.tags.push('overdue');
//   }

//   // Add type-specific tags
//   if (this.type === 'site_visit' && !this.tags.includes('field-work')) {
//     this.tags.push('field-work');
//   }

//   next();
// });

// // === VIRTUAL FIELDS ===
// ReminderSchema.virtual('isOverdue').get(function () {
//   return this.status === 'pending' && this.scheduledAt < new Date();
// });

// ReminderSchema.virtual('timeUntilDue').get(function () {
//   return this.scheduledAt.getTime() - Date.now();
// });

// ReminderSchema.virtual('daysOverdue').get(function () {
//   if (!this.isOverdue) return 0;
//   return Math.floor(
//     (Date.now() - this.scheduledAt.getTime()) / (1000 * 60 * 60 * 24),
//   );
// });

// // === STATIC METHODS ===
// ReminderSchema.statics.findOverdue = function () {
//   return this.find({
//     status: { $in: ['pending', 'overdue'] },
//     scheduledAt: { $lt: new Date() },
//   });
// };

// ReminderSchema.statics.findUpcoming = function (hours = 24) {
//   const now = new Date();
//   const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

//   return this.find({
//     status: 'pending',
//     scheduledAt: { $gte: now, $lte: futureTime },
//   });
// };

// ReminderSchema.statics.findByUser = function (userId: string, status?: string) {
//   const query: any = { assignedTo: userId };
//   if (status) query.status = status;

//   return this.find(query).sort({ scheduledAt: 1 });
// };

// // === INSTANCE METHODS ===
// ReminderSchema.methods.markCompleted = function (
//   notes?: string,
//   outcome?: string,
// ) {
//   this.status = 'completed';
//   this.completedAt = new Date();
//   if (notes) this.completionNotes = notes;
//   if (outcome) this.outcome = outcome;
//   return this.save();
// };

// ReminderSchema.methods.reschedule = function (newDate: Date, reason?: string) {
//   this.rescheduledFrom = this.scheduledAt;
//   this.scheduledAt = newDate;
//   this.status = 'pending';
//   this.rescheduleCount += 1;
//   if (reason) this.rescheduleReason = reason;
//   return this.save();
// };

// ReminderSchema.methods.cancel = function (reason?: string) {
//   this.status = 'cancelled';
//   if (reason) this.completionNotes = `Cancelled: ${reason}`;
//   return this.save();
// };
