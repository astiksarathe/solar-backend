// import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
// import { Document, Types } from 'mongoose';

// export type ActivityLogDocument = ActivityLog & Document;

// /**
//  * ActivityLog Schema
//  *
//  * This collection maintains a comprehensive audit trail of all activities and changes
//  * across the entire solar CRM system. It tracks every interaction, modification,
//  * and event to ensure complete transparency and accountability.
//  *
//  * Used for: compliance, debugging, analytics, user behavior tracking, and reporting
//  */
// @Schema({
//   timestamps: true,
//   collection: 'activity_logs',
// })
// export class ActivityLog {
//   // === ENTITY REFERENCE ===

//   /** Reference to the entity that was affected by this activity */
//   @Prop({
//     type: Types.ObjectId,
//     required: true,
//     refPath: 'entityModel',
//     index: true,
//   })
//   entityId: Types.ObjectId;

//   /** Type of entity this activity relates to */
//   @Prop({
//     required: true,
//     enum: ['ConsumerData', 'Lead', 'Order', 'Reminder', 'User', 'System'],
//     index: true,
//   })
//   entityModel: string;

//   // === ACTIVITY DETAILS ===

//   /** Type of action performed */
//   @Prop({
//     required: true,
//     enum: [
//       // CRUD Operations
//       'created', // Entity was created
//       'updated', // Entity was modified
//       'deleted', // Entity was deleted
//       'restored', // Soft-deleted entity was restored

//       // Status Changes
//       'status_changed', // Status field was updated
//       'converted', // Entity converted to another type (e.g., lead to order)
//       'assigned', // Entity assigned to user
//       'reassigned', // Entity reassigned to different user

//       // Communication Activities
//       'called', // Phone call made/received
//       'emailed', // Email sent/received
//       'messaged', // WhatsApp/SMS sent
//       'visited', // Site visit conducted
//       'met', // Meeting held

//       // Lead/Order Specific
//       'proposal_sent', // Proposal/quotation sent
//       'payment_received', // Payment recorded
//       'document_uploaded', // Document added
//       'installation_scheduled', // Installation date set
//       'system_commissioned', // System went live

//       // Reminder/Follow-up
//       'reminder_created', // Follow-up reminder set
//       'reminder_completed', // Reminder task completed
//       'reminder_rescheduled', // Reminder date changed

//       // Data Operations
//       'data_scraped', // New data scraped from source
//       'data_enriched', // Additional data added
//       'data_validated', // Data quality checked
//       'data_exported', // Data exported to external system
//       'data_imported', // Data imported from external source

//       // System Activities
//       'login', // User logged in
//       'logout', // User logged out
//       'password_changed', // Password updated
//       'settings_changed', // System settings modified
//       'backup_created', // Data backup performed
//       'report_generated', // Report created

//       // Integration Activities
//       'api_call_made', // External API called
//       'webhook_received', // Webhook event received
//       'sync_completed', // Data sync with external system
//       'notification_sent', // Notification delivered

//       // Other
//       'comment_added', // Note/comment added
//       'tag_added', // Tag assigned
//       'tag_removed', // Tag removed
//       'file_uploaded', // File attachment added
//       'file_downloaded', // File downloaded
//       'other', // Custom activity type
//     ],
//     index: true,
//   })
//   action: string;

//   /** Detailed description of what happened */
//   @Prop({
//     required: true,
//     trim: true,
//     maxlength: 1000,
//   })
//   description: string;

//   /** Summary for quick overview (shorter than description) */
//   @Prop({
//     trim: true,
//     maxlength: 200,
//   })
//   summary?: string;

//   // === CHANGE TRACKING ===

//   /** Detailed tracking of field changes for update operations */
//   @Prop({
//     type: [
//       {
//         field: { type: String, required: true, trim: true }, // Name of the field that changed
//         oldValue: { type: Object }, // Previous value (can be any type)
//         newValue: { type: Object }, // New value (can be any type)
//         dataType: {
//           type: String,
//           enum: ['string', 'number', 'boolean', 'date', 'array', 'object'],
//           required: true,
//         }, // Type of data for proper handling
//       },
//     ],
//     default: [],
//   })
//   changes: Array<{
//     field: string;
//     oldValue?: any;
//     newValue?: any;
//     dataType: string;
//   }>;

//   // === USER INFORMATION ===

//   /** Who performed this activity */
//   @Prop({
//     required: true,
//     index: true,
//   })
//   performedBy: string; // User ID or 'system' for automated actions

//   /** User's role at the time of action */
//   @Prop({
//     trim: true,
//     index: true,
//   })
//   userRole?: string;

//   /** Department/team of the user */
//   @Prop({
//     enum: [
//       'sales',
//       'technical',
//       'installation',
//       'admin',
//       'management',
//       'system',
//     ],
//     index: true,
//   })
//   userDepartment?: string;

//   // === CONTEXT INFORMATION ===

//   /** How this activity was triggered */
//   @Prop({
//     enum: [
//       'manual', // User manually performed action
//       'automated', // System automated action
//       'api', // Via API call
//       'import', // Data import operation
//       'sync', // Synchronization process
//       'scheduled', // Scheduled task
//       'webhook', // External webhook trigger
//       'migration', // Data migration
//     ],
//     required: true,
//     default: 'manual',
//     index: true,
//   })
//   trigger: string;

//   /** Source system or application that initiated this activity */
//   @Prop({
//     enum: [
//       'web_app',
//       'mobile_app',
//       'api',
//       'admin_panel',
//       'scraper',
//       'cron_job',
//       'external_system',
//     ],
//     index: true,
//   })
//   source?: string;

//   // === TECHNICAL METADATA ===

//   /** Technical details about the request/action */
//   @Prop({
//     type: {
//       ipAddress: { type: String, trim: true }, // Client IP address
//       userAgent: { type: String, trim: true }, // Browser/client info
//       deviceType: {
//         type: String,
//         enum: ['desktop', 'mobile', 'tablet', 'api', 'server'],
//       },
//       browser: { type: String, trim: true }, // Browser name
//       operatingSystem: { type: String, trim: true }, // OS info
//       sessionId: { type: String, trim: true }, // User session identifier
//       requestId: { type: String, trim: true }, // Unique request ID for debugging
//     },
//   })
//   metadata?: {
//     ipAddress?: string;
//     userAgent?: string;
//     deviceType?: string;
//     browser?: string;
//     operatingSystem?: string;
//     sessionId?: string;
//     requestId?: string;
//   };

//   // === BUSINESS CONTEXT ===

//   /** Business-specific context for this activity */
//   @Prop({
//     type: {
//       // Customer Context
//       customerName: { type: String, trim: true },
//       customerPhone: { type: String, trim: true },
//       customerType: { type: String, trim: true },

//       // Financial Context
//       amount: { type: Number, min: 0 }, // Money involved in activity
//       currency: { type: String, default: 'INR', trim: true },

//       // Project Context
//       projectPhase: { type: String, trim: true }, // Which phase of project
//       orderNumber: { type: String, trim: true }, // Related order number
//       systemCapacity: { type: Number, min: 0 }, // Solar system size

//       // Communication Context
//       communicationType: { type: String, trim: true }, // Type of communication
//       communicationOutcome: { type: String, trim: true }, // Result of communication

//       // Location Context
//       location: { type: String, trim: true }, // Where activity happened
//       coordinates: {
//         type: {
//           latitude: { type: Number, min: -90, max: 90 },
//           longitude: { type: Number, min: -180, max: 180 },
//         },
//       },

//       // Team Context
//       teamMembers: { type: [String] }, // Other team members involved
//       assignedTo: { type: String, trim: true }, // Current assignee
//       previouslyAssignedTo: { type: String, trim: true }, // Previous assignee
//     },
//   })
//   businessContext?: {
//     customerName?: string;
//     customerPhone?: string;
//     customerType?: string;
//     amount?: number;
//     currency?: string;
//     projectPhase?: string;
//     orderNumber?: string;
//     systemCapacity?: number;
//     communicationType?: string;
//     communicationOutcome?: string;
//     location?: string;
//     coordinates?: {
//       latitude: number;
//       longitude: number;
//     };
//     teamMembers?: string[];
//     assignedTo?: string;
//     previouslyAssignedTo?: string;
//   };

//   // === COMMUNICATION TRACKING ===

//   /** Details for communication-related activities */
//   @Prop({
//     type: {
//       channel: {
//         type: String,
//         enum: ['phone', 'email', 'whatsapp', 'sms', 'in_person', 'video_call'],
//       },
//       direction: {
//         type: String,
//         enum: ['inbound', 'outbound'],
//       },
//       duration: { type: Number, min: 0 }, // Duration in minutes
//       successful: { type: Boolean }, // Was communication successful?
//       contactAttempts: { type: Number, min: 1, default: 1 }, // Number of attempts
//       responseReceived: { type: Boolean, default: false }, // Did customer respond?
//       nextActionRequired: { type: String, trim: true }, // What should happen next?
//     },
//   })
//   communicationDetails?: {
//     channel?: string;
//     direction?: string;
//     duration?: number;
//     successful?: boolean;
//     contactAttempts?: number;
//     responseReceived?: boolean;
//     nextActionRequired?: string;
//   };

//   // === ERROR HANDLING ===

//   /** Error information if activity failed */
//   @Prop({
//     type: {
//       hasError: { type: Boolean, default: false },
//       errorCode: { type: String, trim: true },
//       errorMessage: { type: String, trim: true },
//       stackTrace: { type: String }, // For technical debugging
//       retryAttempts: { type: Number, min: 0, default: 0 },
//       resolved: { type: Boolean, default: false },
//       resolutionNotes: { type: String, trim: true },
//     },
//   })
//   errorInfo?: {
//     hasError?: boolean;
//     errorCode?: string;
//     errorMessage?: string;
//     stackTrace?: string;
//     retryAttempts?: number;
//     resolved?: boolean;
//     resolutionNotes?: string;
//   };

//   // === PERFORMANCE METRICS ===

//   /** Performance and timing information */
//   @Prop({
//     type: {
//       startTime: { type: Date }, // When activity started
//       endTime: { type: Date }, // When activity completed
//       duration: { type: Number, min: 0 }, // Duration in milliseconds
//       processingTime: { type: Number, min: 0 }, // Server processing time
//       databaseQueryCount: { type: Number, min: 0 }, // Number of DB queries
//       externalApiCalls: { type: Number, min: 0 }, // External API calls made
//     },
//   })
//   performance?: {
//     startTime?: Date;
//     endTime?: Date;
//     duration?: number;
//     processingTime?: number;
//     databaseQueryCount?: number;
//     externalApiCalls?: number;
//   };

//   // === INTEGRATION DATA ===

//   /** Information about external system integrations */
//   @Prop({
//     type: {
//       externalSystemId: { type: String, trim: true }, // External system identifier
//       externalEntityId: { type: String, trim: true }, // Entity ID in external system
//       syncDirection: {
//         type: String,
//         enum: ['inbound', 'outbound', 'bidirectional'],
//       },
//       syncStatus: {
//         type: String,
//         enum: ['success', 'failed', 'partial', 'skipped'],
//       },
//       webhookId: { type: String, trim: true }, // Webhook event ID
//       apiEndpoint: { type: String, trim: true }, // API endpoint called
//       httpMethod: { type: String, trim: true }, // HTTP method used
//       responseCode: { type: Number }, // HTTP response code
//       dataSize: { type: Number, min: 0 }, // Size of data transferred (bytes)
//     },
//   })
//   integrationData?: {
//     externalSystemId?: string;
//     externalEntityId?: string;
//     syncDirection?: string;
//     syncStatus?: string;
//     webhookId?: string;
//     apiEndpoint?: string;
//     httpMethod?: string;
//     responseCode?: number;
//     dataSize?: number;
//   };

//   // === DATA QUALITY ===

//   /** Data quality and validation information */
//   @Prop({
//     type: {
//       dataQualityScore: { type: Number, min: 0, max: 100 }, // Overall data quality score
//       validationErrors: { type: [String] }, // Validation errors found
//       missingFields: { type: [String] }, // Required fields that are missing
//       duplicateCheck: { type: Boolean }, // Was duplicate check performed?
//       duplicateFound: { type: Boolean }, // Were duplicates detected?
//       dataEnrichment: { type: Boolean }, // Was data enriched?
//       enrichmentSource: { type: String, trim: true }, // Source of enrichment
//     },
//   })
//   dataQuality?: {
//     dataQualityScore?: number;
//     validationErrors?: string[];
//     missingFields?: string[];
//     duplicateCheck?: boolean;
//     duplicateFound?: boolean;
//     dataEnrichment?: boolean;
//     enrichmentSource?: string;
//   };

//   // === CATEGORIZATION ===

//   /** Category of this activity for reporting/filtering */
//   @Prop({
//     enum: [
//       'data_management', // Data-related activities
//       'customer_interaction', // Customer communication
//       'sales_activity', // Sales process activities
//       'project_management', // Project execution activities
//       'system_operation', // System/technical activities
//       'financial', // Payment/financial activities
//       'compliance', // Regulatory/compliance activities
//       'maintenance', // System maintenance activities
//       'reporting', // Report generation
//       'integration', // External system integration
//       'security', // Security-related activities
//       'other',
//     ],
//     index: true,
//   })
//   category?: string;

//   /** Subcategory for more granular classification */
//   @Prop({
//     trim: true,
//     index: true,
//   })
//   subcategory?: string;

//   /** Importance level of this activity */
//   @Prop({
//     enum: ['low', 'medium', 'high', 'critical'],
//     default: 'medium',
//     index: true,
//   })
//   importance: string;

//   /** Tags for flexible categorization */
//   @Prop({
//     type: [String],
//     default: [],
//     index: true,
//   })
//   tags: string[];

//   // === RELATED ACTIVITIES ===

//   /** Reference to parent activity (for grouped/related activities) */
//   @Prop({
//     type: Types.ObjectId,
//     ref: 'ActivityLog',
//   })
//   parentActivityId?: Types.ObjectId;

//   /** References to related activities */
//   @Prop({
//     type: [{ type: Types.ObjectId, ref: 'ActivityLog' }],
//     default: [],
//   })
//   relatedActivities: Types.ObjectId[];

//   /** Sequence number for ordered activities */
//   @Prop({
//     min: 1,
//   })
//   sequenceNumber?: number;

//   // === NOTIFICATIONS ===

//   /** Whether notifications were sent for this activity */
//   @Prop({
//     type: {
//       notificationSent: { type: Boolean, default: false },
//       notificationChannels: { type: [String] }, // email, sms, push, slack
//       notificationRecipients: { type: [String] }, // User IDs who were notified
//       notificationFailures: { type: [String] }, // Failed notification attempts
//     },
//   })
//   notifications?: {
//     notificationSent?: boolean;
//     notificationChannels?: string[];
//     notificationRecipients?: string[];
//     notificationFailures?: string[];
//   };

//   // === ARCHIVAL ===

//   /** Archival and retention information */
//   @Prop({
//     type: {
//       archived: { type: Boolean, default: false },
//       archivedAt: { type: Date },
//       retentionPeriod: { type: Number }, // Days to retain
//       purgeEligible: { type: Boolean, default: false },
//       purgeDate: { type: Date },
//     },
//   })
//   archival?: {
//     archived?: boolean;
//     archivedAt?: Date;
//     retentionPeriod?: number;
//     purgeEligible?: boolean;
//     purgeDate?: Date;
//   };

//   // === CUSTOM FIELDS ===

//   /** Flexible storage for custom business-specific fields */
//   @Prop({
//     type: Object,
//     default: {},
//   })
//   customFields?: Record<string, any>;

//   // Timestamps are automatically added by @Schema({ timestamps: true })
//   createdAt?: Date;
//   updatedAt?: Date;
// }

// export const ActivityLogSchema = SchemaFactory.createForClass(ActivityLog);

// // === INDEXES FOR PERFORMANCE ===
// ActivityLogSchema.index({ entityId: 1, entityModel: 1, createdAt: -1 }); // Entity activity history
// ActivityLogSchema.index({ performedBy: 1, createdAt: -1 }); // User activity history
// ActivityLogSchema.index({ action: 1, createdAt: -1 }); // Action-based queries
// ActivityLogSchema.index({ category: 1, subcategory: 1 }); // Category-based filtering
// ActivityLogSchema.index({ trigger: 1, source: 1 }); // Source analysis
// ActivityLogSchema.index({ importance: 1, createdAt: -1 }); // Important activities first
// ActivityLogSchema.index({ 'businessContext.customerPhone': 1 }); // Customer activity lookup
// ActivityLogSchema.index({ 'businessContext.orderNumber': 1 }); // Order-related activities
// ActivityLogSchema.index({ 'errorInfo.hasError': 1, createdAt: -1 }); // Error analysis
// ActivityLogSchema.index({
//   'archival.archived': 1,
//   'archival.purgeEligible': 1,
// }); // Archival management

// // === PRE-SAVE MIDDLEWARE ===
// ActivityLogSchema.pre('save', function (next) {
//   // Auto-categorize based on action if category not provided
//   if (!this.category) {
//     const actionCategories = {
//       created: 'data_management',
//       updated: 'data_management',
//       deleted: 'data_management',
//       called: 'customer_interaction',
//       emailed: 'customer_interaction',
//       visited: 'customer_interaction',
//       proposal_sent: 'sales_activity',
//       payment_received: 'financial',
//       status_changed: 'project_management',
//       system_commissioned: 'project_management',
//       data_scraped: 'data_management',
//       login: 'system_operation',
//       api_call_made: 'integration',
//     };

//     this.category = actionCategories[this.action] || 'other';
//   }

//   // Set importance based on action type
//   if (!this.importance || this.importance === 'medium') {
//     const highImportanceActions = [
//       'payment_received',
//       'system_commissioned',
//       'order_cancelled',
//       'data_breach',
//       'system_error',
//     ];

//     const lowImportanceActions = [
//       'login',
//       'logout',
//       'file_downloaded',
//       'comment_added',
//     ];

//     if (highImportanceActions.includes(this.action)) {
//       this.importance = 'high';
//     } else if (lowImportanceActions.includes(this.action)) {
//       this.importance = 'low';
//     }
//   }

//   // Generate summary if not provided
//   if (!this.summary && this.description) {
//     this.summary =
//       this.description.length > 200
//         ? this.description.substring(0, 197) + '...'
//         : this.description;
//   }

//   // Set retention period based on importance
//   if (!this.archival?.retentionPeriod) {
//     const retentionPeriods = {
//       critical: 2555, // 7 years
//       high: 1095, // 3 years
//       medium: 730, // 2 years
//       low: 365, // 1 year
//     };

//     if (!this.archival) this.archival = {};
//     this.archival.retentionPeriod = retentionPeriods[this.importance];

//     // Set purge date
//     const purgeDate = new Date();
//     purgeDate.setDate(purgeDate.getDate() + this.archival.retentionPeriod);
//     this.archival.purgeDate = purgeDate;
//   }

//   // Add automatic tags based on content
//   if (!this.tags) this.tags = [];

//   // Add action-based tags
//   if (!this.tags.includes(this.action)) {
//     this.tags.push(this.action);
//   }

//   // Add entity-based tags
//   if (!this.tags.includes(this.entityModel.toLowerCase())) {
//     this.tags.push(this.entityModel.toLowerCase());
//   }

//   // Add error tag if there was an error
//   if (this.errorInfo?.hasError && !this.tags.includes('error')) {
//     this.tags.push('error');
//   }

//   // Add customer type tag if available
//   if (
//     this.businessContext?.customerType &&
//     !this.tags.includes(this.businessContext.customerType)
//   ) {
//     this.tags.push(this.businessContext.customerType);
//   }

//   next();
// });

// // === STATIC METHODS ===
// ActivityLogSchema.statics.findByEntity = function (
//   entityId: string,
//   entityModel: string,
//   limit = 50,
// ) {
//   return this.find({ entityId, entityModel })
//     .sort({ createdAt: -1 })
//     .limit(limit)
//     .lean();
// };

// ActivityLogSchema.statics.findByUser = function (
//   userId: string,
//   startDate?: Date,
//   endDate?: Date,
// ) {
//   const query: any = { performedBy: userId };

//   if (startDate || endDate) {
//     query.createdAt = {};
//     if (startDate) query.createdAt.$gte = startDate;
//     if (endDate) query.createdAt.$lte = endDate;
//   }

//   return this.find(query).sort({ createdAt: -1 });
// };

// ActivityLogSchema.statics.findErrors = function (
//   startDate?: Date,
//   resolved = false,
// ) {
//   const query: any = { 'errorInfo.hasError': true };

//   if (startDate) {
//     query.createdAt = { $gte: startDate };
//   }

//   if (resolved !== undefined) {
//     query['errorInfo.resolved'] = resolved;
//   }

//   return this.find(query).sort({ createdAt: -1 });
// };

// ActivityLogSchema.statics.getActivitySummary = function (
//   startDate: Date,
//   endDate: Date,
// ) {
//   return this.aggregate([
//     {
//       $match: {
//         createdAt: { $gte: startDate, $lte: endDate },
//       },
//     },
//     {
//       $group: {
//         _id: {
//           action: '$action',
//           category: '$category',
//         },
//         count: { $sum: 1 },
//         users: { $addToSet: '$performedBy' },
//       },
//     },
//     {
//       $sort: { count: -1 },
//     },
//   ]);
// };

// // === INSTANCE METHODS ===
// ActivityLogSchema.methods.markArchived = function () {
//   if (!this.archival) this.archival = {};
//   this.archival.archived = true;
//   this.archival.archivedAt = new Date();
//   return this.save();
// };

// ActivityLogSchema.methods.addRelatedActivity = function (
//   activityId: Types.ObjectId,
// ) {
//   if (!this.relatedActivities.includes(activityId)) {
//     this.relatedActivities.push(activityId);
//     return this.save();
//   }
//   return Promise.resolve(this);
// };

// ActivityLogSchema.methods.resolveError = function (resolutionNotes?: string) {
//   if (this.errorInfo?.hasError) {
//     if (!this.errorInfo) this.errorInfo = { hasError: true };
//     this.errorInfo.resolved = true;
//     if (resolutionNotes) {
//       this.errorInfo.resolutionNotes = resolutionNotes;
//     }
//     return this.save();
//   }
//   return Promise.resolve(this);
// };
