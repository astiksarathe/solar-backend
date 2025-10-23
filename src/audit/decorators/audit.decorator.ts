import { SetMetadata } from '@nestjs/common';

export interface AuditOptions {
  entityType?: string;
  entityId?: string;
  module?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category?:
    | 'DATA_CHANGE'
    | 'SECURITY'
    | 'BUSINESS_PROCESS'
    | 'SYSTEM_EVENT'
    | 'USER_ACTION'
    | 'COMPLIANCE'
    | 'ERROR'
    | 'PERFORMANCE';
  skipAudit?: boolean;
  additionalMetadata?: Record<string, any>;
}

/**
 * Decorator to enable/configure audit logging for a controller method
 *
 * @param options Audit configuration options
 *
 * @example
 * ```typescript
 * @Audit({
 *   entityType: 'ConsumerHistory',
 *   module: 'CONSUMER_HISTORY',
 *   priority: 'HIGH'
 * })
 * @Patch(':id/complete')
 * async completeInteraction(@Param('id') id: string) {
 *   // method implementation
 * }
 * ```
 */
export const Audit = (options: AuditOptions = {}) =>
  SetMetadata('audit', options);

/**
 * Decorator to disable audit logging for a controller method
 *
 * @example
 * ```typescript
 * @NoAudit()
 * @Get('health')
 * getHealth() {
 *   return { status: 'ok' };
 * }
 * ```
 */
export const NoAudit = () => SetMetadata('audit', false);

/**
 * Decorator for high-priority audit events
 *
 * @param options Additional audit options
 *
 * @example
 * ```typescript
 * @HighPriorityAudit({
 *   entityType: 'Order',
 *   module: 'ORDERS'
 * })
 * @Delete(':id')
 * async deleteOrder(@Param('id') id: string) {
 *   // method implementation
 * }
 * ```
 */
export const HighPriorityAudit = (
  options: Omit<AuditOptions, 'priority'> = {},
) => SetMetadata('audit', { ...options, priority: 'HIGH' });

/**
 * Decorator for security-related audit events
 *
 * @param options Additional audit options
 *
 * @example
 * ```typescript
 * @SecurityAudit({
 *   entityType: 'User',
 *   module: 'AUTH'
 * })
 * @Post('login')
 * async login(@Body() loginDto: LoginDto) {
 *   // method implementation
 * }
 * ```
 */
export const SecurityAudit = (
  options: Omit<AuditOptions, 'category' | 'priority'> = {},
) =>
  SetMetadata('audit', {
    ...options,
    category: 'SECURITY',
    priority: 'HIGH',
  });

/**
 * Decorator for compliance-related audit events
 *
 * @param options Additional audit options
 *
 * @example
 * ```typescript
 * @ComplianceAudit({
 *   entityType: 'ConsumerData',
 *   module: 'CONSUMER_DATA'
 * })
 * @Delete(':id')
 * async deleteConsumerData(@Param('id') id: string) {
 *   // method implementation
 * }
 * ```
 */
export const ComplianceAudit = (options: Omit<AuditOptions, 'category'> = {}) =>
  SetMetadata('audit', {
    ...options,
    category: 'COMPLIANCE',
    priority: options.priority || 'HIGH',
  });

/**
 * Decorator for bulk operation audit events
 *
 * @param options Additional audit options
 *
 * @example
 * ```typescript
 * @BulkOperationAudit({
 *   entityType: 'ConsumerHistory',
 *   module: 'CONSUMER_HISTORY'
 * })
 * @Patch('bulk-update')
 * async bulkUpdateStatus(@Body() bulkUpdateDto: BulkUpdateDto) {
 *   // method implementation
 * }
 * ```
 */
export const BulkOperationAudit = (options: AuditOptions = {}) =>
  SetMetadata('audit', {
    ...options,
    priority: options.priority || 'MEDIUM',
    additionalMetadata: {
      ...options.additionalMetadata,
      isBulkOperation: true,
    },
  });
