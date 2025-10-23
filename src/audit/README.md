# Solar Stack Backend - Audit System Documentation

## Overview

The Solar Stack Backend Audit System provides comprehensive logging and tracking of all application activities, data changes, user actions, and security events. This enterprise-grade audit system ensures compliance, security monitoring, and business intelligence capabilities.

## Architecture

### Core Components

1. **Audit Log Entity** (`audit-log.entity.ts`)
   - Comprehensive MongoDB schema with 50+ fields
   - Automatic indexing for performance
   - TTL for data retention management

2. **DTOs** (`dto/`)
   - `CreateAuditLogDto` - For creating audit entries
   - `QueryAuditLogDto` - Advanced filtering and querying
   - Response DTOs for statistics and exports

3. **Service** (`audit.service.ts`)
   - Core business logic for audit logging
   - Statistics and analytics methods
   - Data retrieval and filtering

4. **Controller** (`audit.controller.ts`)
   - REST API endpoints
   - Role-based access control
   - Export functionality

5. **Interceptor** (`audit.interceptor.ts`)
   - Automatic audit logging for all API operations
   - Intelligent entity detection
   - Performance monitoring

6. **Decorators** (`decorators/audit.decorator.ts`)
   - Manual audit annotations
   - Specialized decorators for different audit types

## Features

### Comprehensive Tracking
- **Data Changes**: Track all CRUD operations with before/after values
- **User Actions**: Log user interactions and custom actions
- **Security Events**: Monitor authentication, authorization, and security-related activities
- **Business Processes**: Track workflow changes and business-critical operations
- **Bulk Operations**: Log batch operations with affected entity counts
- **System Events**: Monitor application performance and system-level events

### Advanced Filtering
- Date ranges with flexible date format support
- Multiple field filtering (module, category, priority, user, entity)
- Text search across actions and descriptions
- Geographic filtering (country, region, city)
- Performance filtering (execution time ranges)
- Success/failure status filtering

### Statistics & Analytics
- Real-time audit statistics
- Module-wise breakdowns
- User activity analytics
- Priority and category distributions
- Time-based trend analysis

### Export Capabilities
- CSV export for spreadsheet analysis
- JSON export for programmatic processing
- Filtered exports with custom date ranges
- Paginated exports for large datasets

### Security & Compliance
- Role-based access control
- Data retention policies with TTL
- Compliance requirement tracking
- Archive functionality for old records
- Secure cleanup operations

## Installation & Setup

### 1. Module Integration

The audit system is automatically integrated into the main application module:

```typescript
// app.module.ts
import { AuditModule } from './audit/audit.module';
import { AuditInterceptor } from './audit/interceptors/audit.interceptor';

@Module({
  imports: [
    // ... other modules
    AuditModule,
  ],
  providers: [
    // ... other providers
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
  ],
})
export class AppModule {}
```

### 2. Database Indexes

MongoDB indexes are automatically created for optimal performance:

```javascript
// Automatically created indexes
db.auditlogs.createIndex({ "timestamp": -1 })
db.auditlogs.createIndex({ "userId": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "module": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "entityType": 1, "entityId": 1 })
db.auditlogs.createIndex({ "category": 1, "priority": 1 })
db.auditlogs.createIndex({ "isSuccessful": 1, "timestamp": -1 })

// Compound indexes for complex queries
db.auditlogs.createIndex({ "module": 1, "category": 1, "timestamp": -1 })
db.auditlogs.createIndex({ "userId": 1, "module": 1, "timestamp": -1 })

// Text search index
db.auditlogs.createIndex({ 
  "action": "text", 
  "description": "text", 
  "username": "text" 
})

// TTL index for automatic cleanup (optional)
db.auditlogs.createIndex({ "createdAt": 1 }, { expireAfterSeconds: 31536000 }) // 1 year
```

### 3. Environment Configuration

Add audit-related environment variables:

```env
# Audit Configuration
AUDIT_RETENTION_DAYS=365
AUDIT_ARCHIVE_THRESHOLD_DAYS=180
AUDIT_MAX_EXPORT_RECORDS=10000
```

## Usage Guide

### Automatic Audit Logging

The audit interceptor automatically logs all API operations. No additional code required for basic tracking.

### Manual Audit Decorators

Use decorators for specialized audit logging:

```typescript
import { 
  Audit, 
  NoAudit, 
  SecurityAudit, 
  ComplianceAudit,
  HighPriorityAudit 
} from '../audit/decorators/audit.decorator';

@Controller('orders')
export class OrdersController {
  
  // High-priority business process audit
  @Post()
  @HighPriorityAudit({
    entityType: 'Order',
    module: 'ORDERS',
    category: 'BUSINESS_PROCESS',
  })
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto);
  }

  // Security audit for sensitive operations
  @Patch(':id/payment')
  @SecurityAudit({
    entityType: 'Order',
    module: 'ORDERS',
    additionalMetadata: { operationType: 'payment_update' },
  })
  updatePayment(@Param('id') id: string, @Body() paymentData: any) {
    return this.ordersService.updatePayment(id, paymentData);
  }

  // Compliance audit for data deletion
  @Delete(':id')
  @ComplianceAudit({
    entityType: 'Order',
    module: 'ORDERS',
  })
  remove(@Param('id') id: string) {
    return this.ordersService.remove(id);
  }

  // Skip audit for read-only operations
  @Get()
  @NoAudit()
  findAll(@Query() query: QueryOrderDto) {
    return this.ordersService.findAll(query);
  }
}
```

### Programmatic Audit Logging

Use the audit service directly for custom logging:

```typescript
import { AuditService } from '../audit/audit.service';

@Injectable()
export class OrdersService {
  constructor(private readonly auditService: AuditService) {}

  async processOrder(orderId: string, userId: string, username: string) {
    try {
      // Business logic here...
      
      // Manual audit logging
      await this.auditService.logDataChange(
        orderId,
        'Order',
        'UPDATE',
        userId,
        username,
        { status: 'processing' },
        { status: 'completed' },
        {
          priority: 'HIGH',
          category: 'BUSINESS_PROCESS',
          metadata: {
            processedAt: new Date(),
            automated: true,
          },
        },
      );
    } catch (error) {
      // Log failed operation
      await this.auditService.logUserAction(
        'Order processing failed',
        userId,
        username,
        'ORDERS',
        {
          priority: 'CRITICAL',
          category: 'ERROR',
          isSuccessful: false,
          errorDetails: error.message,
        },
      );
      throw error;
    }
  }
}
```

## API Reference

### Base URL
`/api/audit`

### Authentication
All audit endpoints require JWT authentication. Admin-only endpoints require `ADMIN` role.

### Endpoints

#### GET /audit
Retrieve audit logs with filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `sortBy` (string): Sort field (default: 'timestamp')
- `sortOrder` ('asc' | 'desc'): Sort direction (default: 'desc')
- `fromDate` (string): Start date (ISO format)
- `toDate` (string): End date (ISO format)
- `module` (string): Filter by module
- `category` (string): Filter by category
- `priority` (string): Filter by priority
- `userId` (string): Filter by user
- `entityType` (string): Filter by entity type
- `search` (string): Text search
- `isSuccessful` (boolean): Filter by success status

**Response:**
```json
{
  "data": [/* audit log objects */],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1500,
    "totalPages": 75,
    "hasNext": true,
    "hasPrev": false
  }
}
```

#### GET /audit/stats
Get audit statistics and analytics.

**Query Parameters:**
- `fromDate` (string): Start date for statistics
- `toDate` (string): End date for statistics
- `modules` (string): Comma-separated modules
- `categories` (string): Comma-separated categories

**Response:**
```json
{
  "totalLogs": 1500,
  "successfulOperations": 1450,
  "failedOperations": 50,
  "moduleBreakdown": { /* module statistics */ },
  "categoryBreakdown": { /* category statistics */ },
  "priorityBreakdown": { /* priority statistics */ },
  "userStats": { /* user activity statistics */ },
  "dateRange": {
    "earliest": "2024-01-01T00:00:00Z",
    "latest": "2024-12-15T23:59:59Z"
  }
}
```

#### GET /audit/export
Export audit logs in various formats.

**Query Parameters:**
- `format` ('csv' | 'json'): Export format (default: 'csv')
- All filtering parameters from GET /audit

**Response:**
- CSV: `Content-Type: text/csv`
- JSON: `Content-Type: application/json`

#### POST /audit/security-event (Admin only)
Manually log a security event.

**Request Body:**
```json
{
  "action": "Manual security test",
  "ipAddress": "192.168.1.100",
  "userAgent": "Custom Client",
  "severity": "INFO",
  "metadata": {
    "testType": "penetration_test",
    "description": "Security testing"
  }
}
```

#### POST /audit/archive (Admin only)
Archive old audit logs.

**Request Body:**
```json
{
  "cutoffDate": "2024-01-01T00:00:00Z",
  "dryRun": true
}
```

#### DELETE /audit/cleanup (Admin only)
Clean up old audit logs permanently.

**Request Body:**
```json
{
  "cutoffDate": "2023-01-01T00:00:00Z",
  "dryRun": true
}
```

## Performance Considerations

### Database Optimization
1. **Indexes**: Automatic index creation for all query patterns
2. **TTL**: Automatic cleanup using MongoDB TTL indexes
3. **Compound Indexes**: Optimized for common filter combinations
4. **Text Search**: Full-text search capability with MongoDB text indexes

### Query Performance
1. **Pagination**: Always use pagination for large result sets
2. **Date Ranges**: Specify date ranges to limit query scope
3. **Field Selection**: Only request needed fields in responses
4. **Caching**: Statistics are cached for frequently accessed data

### Storage Management
1. **Data Retention**: Configure TTL for automatic cleanup
2. **Archiving**: Move old logs to archive collections
3. **Compression**: Use MongoDB compression for storage efficiency
4. **Sharding**: Consider sharding for very large deployments

## Security

### Access Control
- **JWT Authentication**: All endpoints require valid JWT
- **Role-Based Access**: Admin-only endpoints for sensitive operations
- **User Context**: All audit logs include user information
- **IP Tracking**: Client IP addresses are logged for security events

### Data Protection
- **Sensitive Data**: Automatic sanitization of passwords and sensitive fields
- **Encryption**: Consider field-level encryption for highly sensitive data
- **Audit Integrity**: Immutable audit logs with checksums
- **Compliance**: Built-in compliance requirement tracking

## Monitoring & Alerting

### Critical Events
Monitor for these audit patterns:
- High number of failed operations
- Security events with HIGH or CRITICAL priority
- Unusual user activity patterns
- Data deletion operations
- Admin action patterns

### Recommended Alerts
1. **Failed Login Attempts**: > 5 failed attempts per user per hour
2. **Critical Security Events**: Any CRITICAL priority security event
3. **Data Deletion**: Any compliance audit with DELETE operation
4. **System Errors**: > 10 failed operations per minute
5. **Admin Actions**: All admin-level audit activities

## Troubleshooting

### Common Issues

#### Performance Issues
- **Symptom**: Slow audit queries
- **Solution**: Check indexes, use date ranges, implement pagination

#### Storage Issues
- **Symptom**: Rapidly growing audit collection
- **Solution**: Configure TTL, implement archiving, check log levels

#### Missing Audit Logs
- **Symptom**: Expected audit logs not appearing
- **Solution**: Check interceptor configuration, verify decorator usage

#### Export Timeouts
- **Symptom**: Export operations timing out
- **Solution**: Reduce date ranges, implement streaming exports

### Debug Mode
Enable debug logging for audit operations:

```env
LOG_LEVEL=debug
AUDIT_DEBUG=true
```

### Health Checks
Monitor audit system health:

```bash
# Check audit log count
curl -H "Authorization: Bearer $JWT" \
  "http://localhost:3000/api/audit/stats" | jq '.totalLogs'

# Check recent audit activity
curl -H "Authorization: Bearer $JWT" \
  "http://localhost:3000/api/audit?limit=1&sortBy=timestamp&sortOrder=desc"
```

## Migration & Deployment

### Database Migration
```javascript
// Migration script for existing systems
db.runCommand({
  createIndexes: "auditlogs",
  indexes: [
    { key: { "timestamp": -1 }, name: "timestamp_desc" },
    { key: { "userId": 1, "timestamp": -1 }, name: "user_timestamp" },
    { key: { "module": 1, "timestamp": -1 }, name: "module_timestamp" },
    // Add all other indexes...
  ]
});
```

### Production Deployment
1. **Environment Variables**: Configure retention and limits
2. **Index Creation**: Ensure all indexes are created before going live
3. **Monitoring Setup**: Configure alerts and monitoring
4. **Backup Strategy**: Include audit logs in backup procedures
5. **Testing**: Verify all audit functionality works in production environment

## Best Practices

### Development
1. Use appropriate audit decorators for different operation types
2. Include meaningful metadata in custom audit logs
3. Test audit functionality with your business logic
4. Monitor audit performance impact

### Operations
1. Regular monitoring of audit log growth
2. Periodic cleanup of old audit data
3. Regular backup of audit logs for compliance
4. Performance monitoring of audit queries

### Security
1. Regular review of security audit events
2. Monitor for unusual patterns in audit logs
3. Secure access to audit data
4. Regular compliance reviews

## Support

### Documentation
- API documentation available at `/api/docs` when server is running
- Test collection available in `src/audit/AUDIT_API_TESTS.md`
- Sample usage in `src/audit/test-audit.ts`

### Community
- Report issues on the project repository
- Contribute improvements via pull requests
- Share usage patterns and best practices

---

*Last updated: December 2024*
*Version: 1.0.0*