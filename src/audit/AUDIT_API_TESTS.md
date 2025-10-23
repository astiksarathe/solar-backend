# Audit System API Testing

This collection contains tests for the Solar Stack Backend Audit System.

## Authentication

First, get a JWT token by signing in:

```
POST {{base_url}}/auth/signin
{
  "email": "your-email@example.com",
  "password": "your-password"
}
```

Use the returned token in the Authorization header for subsequent requests:
`Authorization: Bearer <your-jwt-token>`

## Test Scenarios

### 1. View Recent Audit Logs

```
GET {{base_url}}/audit?page=1&limit=10&sortBy=timestamp&sortOrder=desc
```

### 2. Filter Audit Logs by Module

```
GET {{base_url}}/audit?module=ORDERS&page=1&limit=10
```

### 3. Search Audit Logs

```
GET {{base_url}}/audit?search=order&page=1&limit=5
```

### 4. Filter by Date Range

```
GET {{base_url}}/audit?fromDate=2024-12-01T00:00:00Z&toDate=2024-12-31T23:59:59Z&page=1&limit=10
```

### 5. Filter by Priority

```
GET {{base_url}}/audit?priority=HIGH&page=1&limit=10
```

### 6. Filter by Category

```
GET {{base_url}}/audit?category=SECURITY&page=1&limit=10
```

### 7. Filter by User

```
GET {{base_url}}/audit?userId={{user_id}}&page=1&limit=10
```

### 8. Get Audit Statistics

```
GET {{base_url}}/audit/stats
```

### 9. Get Audit Statistics with Filters

```
GET {{base_url}}/audit/stats?fromDate=2024-12-01T00:00:00Z&toDate=2024-12-31T23:59:59Z
```

### 10. Export Audit Logs (CSV)

```
GET {{base_url}}/audit/export?format=csv&fromDate=2024-12-01T00:00:00Z&toDate=2024-12-31T23:59:59Z
```

### 11. Export Audit Logs (JSON)

```
GET {{base_url}}/audit/export?format=json&module=ORDERS
```

### 12. Log Security Event (Manual)

```
POST {{base_url}}/audit/security-event
{
  "action": "Manual security test",
  "ipAddress": "192.168.1.100",
  "userAgent": "Bruno API Client",
  "severity": "INFO",
  "metadata": {
    "testType": "manual_security_test",
    "description": "Testing security event logging"
  }
}
```

### 13. Get Audit Log by ID

```
GET {{base_url}}/audit/{{audit_log_id}}
```

### 14. Archive Old Audit Logs

```
POST {{base_url}}/audit/archive
{
  "cutoffDate": "2024-01-01T00:00:00Z",
  "dryRun": true
}
```

### 15. Cleanup Old Audit Logs (Admin Only)

```
DELETE {{base_url}}/audit/cleanup
{
  "cutoffDate": "2023-01-01T00:00:00Z",
  "dryRun": true
}
```

## Test Workflow

1. **Authentication**: Sign in to get JWT token
2. **Basic Retrieval**: Get recent audit logs
3. **Filtering**: Test different filter combinations
4. **Search**: Test text search functionality
5. **Statistics**: Get audit statistics
6. **Export**: Test export functionality
7. **Manual Logging**: Test manual security event logging
8. **Admin Functions**: Test archive/cleanup (if admin)

## Expected Responses

### Successful List Response
```json
{
  "data": [
    {
      "_id": "...",
      "entityId": "...",
      "entityType": "Order",
      "operation": "UPDATE",
      "action": "Order status changed",
      "userId": "...",
      "username": "user@example.com",
      "timestamp": "2024-12-...",
      "module": "ORDERS",
      "category": "BUSINESS_PROCESS",
      "priority": "HIGH",
      "isSuccessful": true,
      "oldValues": { "status": "pending" },
      "newValues": { "status": "confirmed" },
      "changedFields": ["status"],
      "requestMetadata": { ... },
      "metadata": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Statistics Response
```json
{
  "totalLogs": 1250,
  "successfulOperations": 1200,
  "failedOperations": 50,
  "moduleBreakdown": {
    "ORDERS": 450,
    "CONSUMER_HISTORY": 350,
    "AUTH": 200,
    "CONSUMER_DATA": 150,
    "LEADS": 100
  },
  "categoryBreakdown": {
    "DATA_CHANGE": 600,
    "BUSINESS_PROCESS": 300,
    "SECURITY": 200,
    "USER_ACTION": 150
  },
  "priorityBreakdown": {
    "LOW": 400,
    "MEDIUM": 500,
    "HIGH": 300,
    "CRITICAL": 50
  },
  "dateRange": {
    "earliest": "2024-01-01T00:00:00Z",
    "latest": "2024-12-15T23:59:59Z"
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Please provide a valid JWT token"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "You don't have permission to access this resource"
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Invalid date format"],
  "error": "Bad Request"
}
```

## Environment Variables

Create a Bruno environment with:

```
base_url: http://localhost:3000/api
user_id: <your-user-id>
audit_log_id: <sample-audit-log-id>
```

## Notes

- All audit endpoints require authentication
- Admin-only endpoints require ADMIN role
- Dates should be in ISO format
- Large exports may take time to process
- Use dry-run options for destructive operations first