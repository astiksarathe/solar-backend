import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as crypto from 'crypto';

export type AuditLogDocument = AuditLog & Document;

/**
 * AuditLog Schema
 *
 * This collection stores all audit trails for data changes across the application.
 * It provides comprehensive tracking of who changed what, when, and why.
 * Supports both automatic and manual audit logging.
 */
@Schema({
  timestamps: true,
  collection: 'audit_logs',
})
export class AuditLog {
  // === CORE AUDIT INFORMATION ===

  /** Unique identifier for the audit log entry */
  @Prop({ required: true, index: true })
  entityId: string;

  /** Type/name of the entity being audited (e.g., 'ConsumerHistory', 'Order', 'ConsumerData') */
  @Prop({ required: true, trim: true, index: true })
  entityType: string;

  /** The operation performed on the entity */
  @Prop({
    required: true,
    enum: [
      'CREATE',
      'READ',
      'UPDATE',
      'DELETE',
      'BULK_UPDATE',
      'BULK_DELETE',
      'STATUS_CHANGE',
      'ASSIGNMENT_CHANGE',
      'APPROVAL',
      'REJECTION',
      'COMPLETION',
      'CANCELLATION',
      'ARCHIVE',
      'RESTORE',
      'LOGIN',
      'LOGOUT',
      'EXPORT',
      'IMPORT',
      'CUSTOM',
    ],
    index: true,
  })
  operation: string;

  /** Brief description of the action performed */
  @Prop({ required: true, trim: true })
  action: string;

  /** Detailed description of what was changed */
  @Prop({ trim: true })
  description?: string;

  // === USER INFORMATION ===

  /** ID of the user who performed the action */
  @Prop({ required: true, index: true })
  userId: string;

  /** Username of the user who performed the action */
  @Prop({ required: true, trim: true, index: true })
  username: string;

  /** Email of the user who performed the action */
  @Prop({ trim: true, lowercase: true })
  userEmail?: string;

  /** Role of the user at the time of action */
  @Prop({ trim: true })
  userRole?: string;

  // === CHANGE TRACKING ===

  /** Previous values before the change (for UPDATE operations) */
  @Prop({ type: Object })
  oldValues?: Record<string, any>;

  /** New values after the change */
  @Prop({ type: Object })
  newValues?: Record<string, any>;

  /** List of specific fields that were changed */
  @Prop({ type: [String], default: [] })
  changedFields?: string[];

  /** Difference/delta between old and new values */
  @Prop({ type: Object })
  delta?: Record<string, { old: any; new: any }>;

  // === REQUEST CONTEXT ===

  /** IP address from which the action was performed */
  @Prop({ trim: true })
  ipAddress?: string;

  /** User agent string from the request */
  @Prop({ trim: true })
  userAgent?: string;

  /** Request ID for tracing */
  @Prop({ trim: true })
  requestId?: string;

  /** Session ID for user session tracking */
  @Prop({ trim: true })
  sessionId?: string;

  /** API endpoint that was called */
  @Prop({ trim: true })
  endpoint?: string;

  /** HTTP method used */
  @Prop({
    enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  })
  httpMethod?: string;

  // === BUSINESS CONTEXT ===

  /** Module/feature area where the action occurred */
  @Prop({
    required: true,
    enum: [
      'CONSUMER_HISTORY',
      'CONSUMER_DATA',
      'ORDERS',
      'REMINDERS',
      'USERS',
      'AUTH',
      'SYSTEM',
      'REPORTS',
      'SETTINGS',
      'AUDIT',
    ],
    index: true,
  })
  module: string;

  /** Sub-module or specific feature */
  @Prop({ trim: true })
  subModule?: string;

  /** Business reason for the change */
  @Prop({ trim: true })
  reason?: string;

  /** Priority level of the audit event */
  @Prop({
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    default: 'MEDIUM',
    index: true,
  })
  priority: string;

  /** Category of the audit event */
  @Prop({
    enum: [
      'DATA_CHANGE',
      'SECURITY',
      'BUSINESS_PROCESS',
      'SYSTEM_EVENT',
      'USER_ACTION',
      'COMPLIANCE',
      'ERROR',
      'PERFORMANCE',
    ],
    default: 'DATA_CHANGE',
    index: true,
  })
  category: string;

  // === ADDITIONAL METADATA ===

  /** Custom tags for categorization and filtering */
  @Prop({ type: [String], default: [], index: true })
  tags?: string[];

  /** Additional metadata specific to the entity or operation */
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  /** Reference to related audit logs */
  @Prop({ type: [String] })
  relatedAuditIds?: string[];

  /** Batch ID for bulk operations */
  @Prop({ trim: true, index: true })
  batchId?: string;

  /** Transaction ID for database transactions */
  @Prop({ trim: true })
  transactionId?: string;

  // === COMPLIANCE & RETENTION ===

  /** Whether this audit log is required for compliance */
  @Prop({ default: false, index: true })
  isComplianceRequired: boolean;

  /** Retention period in days (0 means permanent) */
  @Prop({ default: 2555, min: 0 }) // Default 7 years
  retentionDays: number;

  /** Date when this audit log can be archived/deleted */
  @Prop({ index: true })
  expiryDate?: Date;

  /** Whether this audit log has been archived */
  @Prop({ default: false, index: true })
  isArchived: boolean;

  // === PERFORMANCE TRACKING ===

  /** Time taken to perform the operation (in milliseconds) */
  @Prop({ min: 0 })
  executionTime?: number;

  /** Memory usage during the operation (in bytes) */
  @Prop({ min: 0 })
  memoryUsage?: number;

  /** Whether the operation was successful */
  @Prop({ default: true, index: true })
  isSuccessful: boolean;

  /** Error message if the operation failed */
  @Prop({ trim: true })
  errorMessage?: string;

  /** Error stack trace if available */
  @Prop({ trim: true })
  errorStack?: string;

  // === GEOLOCATION ===

  /** Geographic location where the action was performed */
  @Prop({
    type: {
      country: String,
      region: String,
      city: String,
      coordinates: {
        type: {
          latitude: Number,
          longitude: Number,
        },
      },
    },
  })
  location?: {
    country?: string;
    region?: string;
    city?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  // === SEARCH & INDEXING ===

  /** Computed search text for full-text search */
  @Prop({ trim: true })
  searchText?: string;

  /** Checksum for data integrity verification */
  @Prop({ trim: true })
  checksum?: string;

  // Timestamps are automatically added by @Schema({ timestamps: true })
  createdAt?: Date;
  updatedAt?: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// === INDEXES FOR PERFORMANCE ===

// Compound indexes for common query patterns
AuditLogSchema.index({ entityId: 1, entityType: 1 });
AuditLogSchema.index({ userId: 1, createdAt: -1 });
AuditLogSchema.index({ entityType: 1, operation: 1, createdAt: -1 });
AuditLogSchema.index({ module: 1, createdAt: -1 });
AuditLogSchema.index({ category: 1, priority: 1 });
AuditLogSchema.index({ batchId: 1 });
AuditLogSchema.index({ isArchived: 1, expiryDate: 1 });

// Text index for search functionality
AuditLogSchema.index(
  {
    action: 'text',
    description: 'text',
    searchText: 'text',
    username: 'text',
  },
  {
    name: 'audit_search_index',
  },
);

// TTL index for automatic cleanup of expired logs
AuditLogSchema.index({ expiryDate: 1 }, { expireAfterSeconds: 0 });

// === PRE-SAVE MIDDLEWARE ===

AuditLogSchema.pre('save', function (next) {
  // Calculate expiry date based on retention period
  if (this.retentionDays > 0 && !this.expiryDate) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + this.retentionDays);
    this.expiryDate = expiryDate;
  }

  // Build search text for full-text search
  const searchComponents = [
    this.action,
    this.description,
    this.username,
    this.userEmail,
    this.entityType,
    this.module,
    this.operation,
    ...(this.tags || []),
  ].filter(Boolean);

  this.searchText = searchComponents.join(' ').toLowerCase();

  // Generate checksum for data integrity
  const dataToHash = JSON.stringify({
    entityId: this.entityId,
    entityType: this.entityType,
    operation: this.operation,
    userId: this.userId,
    oldValues: this.oldValues,
    newValues: this.newValues,
    createdAt: this.createdAt,
  });
  this.checksum = crypto.createHash('sha256').update(dataToHash).digest('hex');

  next();
});

// === POST-SAVE MIDDLEWARE ===

AuditLogSchema.post('save', function (doc) {
  // Log critical audit events to external systems
  if (doc.priority === 'CRITICAL' || doc.category === 'SECURITY') {
    console.log(
      `CRITICAL AUDIT EVENT: ${doc.action} by ${doc.username} on ${doc.entityType}`,
    );
    // Here you could integrate with external logging services
  }
});
