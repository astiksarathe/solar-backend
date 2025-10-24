# Consumer History API - cURL Command Examples

This document provides comprehensive cURL command examples for testing all Consumer History API endpoints.

## Setup

Set your environment variables:
```bash
export BASE_URL="http://localhost:3000"
export AUTH_TOKEN="your_jwt_token_here"
```

## 1. Create Consumer History

### Basic Call Interaction
```bash
curl -X POST "${BASE_URL}/consumer-history" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "consumerId": "675b8e5a1234567890abcdef",
    "consumerNumber": "CONS-001",
    "interactionType": "call",
    "status": "completed",
    "title": "Initial inquiry call",
    "description": "Customer called to inquire about solar panel installation for their 3BHK house",
    "notes": "Customer very interested, wants to know about government subsidies and installation process",
    "scheduledDate": "2024-12-01T10:00:00Z",
    "completedDate": "2024-12-01T10:30:00Z",
    "duration": 30,
    "location": "Phone call",
    "contactPerson": "Rajesh Sharma",
    "phoneNumber": "+91 9876543210",
    "emailAddress": "rajesh.sharma@email.com",
    "interestLevel": "very_interested",
    "nextFollowUp": "2024-12-05T10:00:00Z",
    "estimatedBudget": 500000,
    "systemSize": "5kW",
    "assignedTo": "675b8e5a1234567890abcd01",
    "priority": "high",
    "outcome": "successful",
    "tags": ["hot_lead", "residential", "government_subsidy"],
    "customFields": {
      "roofType": "concrete",
      "shadowIssues": false,
      "currentElectricityBill": 8000,
      "referralSource": "google_search"
    }
  }'
```

### Site Visit Interaction
```bash
curl -X POST "${BASE_URL}/consumer-history" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "consumerId": "675b8e5a1234567890abcdef",
    "consumerNumber": "CONS-001",
    "interactionType": "site_visit",
    "status": "pending",
    "title": "Site survey for solar installation",
    "description": "Detailed site survey to assess roof condition and electrical infrastructure",
    "scheduledDate": "2024-12-05T11:00:00Z",
    "location": "123 Green Valley, Sector 45, Gurgaon, Haryana 122003",
    "contactPerson": "Rajesh Sharma",
    "phoneNumber": "+91 9876543210",
    "interestLevel": "ready_to_buy",
    "estimatedBudget": 480000,
    "systemSize": "5kW",
    "assignedTo": "675b8e5a1234567890abcd02",
    "priority": "high",
    "tags": ["site_survey", "ready_to_buy", "residential"]
  }'
```

### Complaint Interaction
```bash
curl -X POST "${BASE_URL}/consumer-history" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "consumerId": "675b8e5a1234567890abcde3",
    "consumerNumber": "CONS-005",
    "interactionType": "complaint",
    "status": "pending",
    "title": "Installation delay complaint",
    "description": "Customer complained about delayed installation and poor communication",
    "notes": "Need immediate escalation, customer very upset. Installation was supposed to start 2 weeks ago",
    "scheduledDate": "2024-12-06T10:00:00Z",
    "contactPerson": "Suresh Gupta",
    "phoneNumber": "+91 9876543214",
    "assignedTo": "675b8e5a1234567890abcd04",
    "priority": "urgent",
    "tags": ["complaint", "installation_delay", "escalation_required"]
  }'
```

## 2. Get Consumer History

### Get All with Basic Pagination
```bash
curl -X GET "${BASE_URL}/consumer-history?page=1&limit=10&sort=createdAt&order=desc" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get by Consumer ID
```bash
curl -X GET "${BASE_URL}/consumer-history?consumerId=675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Filter by Interaction Type
```bash
curl -X GET "${BASE_URL}/consumer-history?interactionType=call,meeting,site_visit&status=completed" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Filter by Priority and Status
```bash
curl -X GET "${BASE_URL}/consumer-history?priority=high,urgent&status=pending&page=1&limit=20" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Budget Range Filter
```bash
curl -X GET "${BASE_URL}/consumer-history?minBudget=400000&maxBudget=800000&interestLevel=very_interested,ready_to_buy" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Date Range Filter
```bash
curl -X GET "${BASE_URL}/consumer-history?fromDate=2024-12-01T00:00:00Z&toDate=2024-12-31T23:59:59Z&status=completed" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Follow-up Date Filter
```bash
curl -X GET "${BASE_URL}/consumer-history?followUpFromDate=2024-12-01T00:00:00Z&followUpToDate=2024-12-07T23:59:59Z" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Search with Text
```bash
curl -X GET "${BASE_URL}/consumer-history?search=solar%20panel%20installation&interestLevel=very_interested" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Filter by Tags
```bash
curl -X GET "${BASE_URL}/consumer-history?tags=hot_lead,residential&priority=high" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Complex Filter Combination
```bash
curl -X GET "${BASE_URL}/consumer-history?consumerId=675b8e5a1234567890abcdef&fromDate=2024-11-01T00:00:00Z&toDate=2024-12-31T23:59:59Z&status=completed&minBudget=300000&interestLevel=very_interested,ready_to_buy&tags=residential&sort=scheduledDate&order=desc&page=1&limit=10" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## 3. Get Single Consumer History
```bash
curl -X GET "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## 4. Update Consumer History

### Basic Update
```bash
curl -X PATCH "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "completedDate": "2024-12-01T10:30:00Z",
    "notes": "Updated: Customer confirmed interest and requested detailed quotation",
    "outcome": "successful",
    "nextFollowUp": "2024-12-05T10:00:00Z"
  }'
```

### Update with Additional Fields
```bash
curl -X PATCH "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "interestLevel": "ready_to_buy",
    "estimatedBudget": 475000,
    "priority": "urgent",
    "tags": ["hot_lead", "residential", "quote_requested"],
    "customFields": {
      "quotationRequested": true,
      "preferredInstallationDate": "2024-12-15"
    }
  }'
```

## 5. Specialized Endpoints

### Get Upcoming Interactions
```bash
curl -X GET "${BASE_URL}/consumer-history/upcoming?assignedTo=675b8e5a1234567890abcd01&days=7" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Overdue Interactions
```bash
curl -X GET "${BASE_URL}/consumer-history/overdue?assignedTo=675b8e5a1234567890abcd01" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Follow-ups Due
```bash
curl -X GET "${BASE_URL}/consumer-history/follow-ups-due?assignedTo=675b8e5a1234567890abcd01&days=7" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Consumer Interaction Summary
```bash
curl -X GET "${BASE_URL}/consumer-history/consumer/675b8e5a1234567890abcdef/summary" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## 6. Interaction Management

### Complete Interaction
```bash
curl -X PATCH "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef/complete" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "successful",
    "notes": "Customer agreed to proceed with installation. Quote accepted.",
    "nextFollowUp": "2024-12-15T10:00:00Z",
    "interestLevel": "ready_to_buy",
    "estimatedBudget": 475000,
    "updatedBy": "675b8e5a1234567890abcd01"
  }'
```

### Reschedule Interaction
```bash
curl -X PATCH "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef/reschedule" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "newDate": "2024-12-10T14:00:00Z",
    "reason": "Customer requested to reschedule due to family function",
    "updatedBy": "675b8e5a1234567890abcd01"
  }'
```

## 7. Analytics and Reporting

### Get Advanced Analytics (All Users)
```bash
curl -X GET "${BASE_URL}/consumer-history/analytics" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Analytics for Specific User
```bash
curl -X GET "${BASE_URL}/consumer-history/analytics?assignedTo=675b8e5a1234567890abcd01" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Get Analytics with Date Range
```bash
curl -X GET "${BASE_URL}/consumer-history/analytics?assignedTo=675b8e5a1234567890abcd01&fromDate=2024-11-01T00:00:00Z&toDate=2024-12-31T23:59:59Z" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## 8. Bulk Operations

### Bulk Update Status
```bash
curl -X PATCH "${BASE_URL}/consumer-history/bulk-update" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "675b8e5a1234567890abcdef",
      "675b8e5a1234567890abcde0",
      "675b8e5a1234567890abcde1"
    ],
    "status": "completed",
    "updatedBy": "675b8e5a1234567890abcd01",
    "notes": "Bulk completed after successful campaign"
  }'
```

### Bulk Update with Different Status
```bash
curl -X PATCH "${BASE_URL}/consumer-history/bulk-update" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": [
      "675b8e5a1234567890abcde2",
      "675b8e5a1234567890abcde3"
    ],
    "status": "cancelled",
    "updatedBy": "675b8e5a1234567890abcd01",
    "notes": "Cancelled due to budget constraints"
  }'
```

## 9. Delete Consumer History
```bash
curl -X DELETE "${BASE_URL}/consumer-history/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

## 10. Error Testing

### Test Invalid ID
```bash
curl -X GET "${BASE_URL}/consumer-history/invalid-id" \
  -H "Authorization: Bearer ${AUTH_TOKEN}"
```

### Test Invalid Status in Bulk Update
```bash
curl -X PATCH "${BASE_URL}/consumer-history/bulk-update" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["675b8e5a1234567890abcdef"],
    "status": "invalid_status",
    "updatedBy": "675b8e5a1234567890abcd01"
  }'
```

### Test Missing Required Fields
```bash
curl -X POST "${BASE_URL}/consumer-history" \
  -H "Authorization: Bearer ${AUTH_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Incomplete data test"
  }'
```

## Response Examples

### Successful Create Response
```json
{
  "_id": "675b8e5a1234567890abcdef",
  "consumerId": "675b8e5a1234567890abcdef",
  "consumerNumber": "CONS-001",
  "interactionType": "call",
  "status": "completed",
  "title": "Initial inquiry call",
  "createdAt": "2024-12-01T10:00:00Z",
  "updatedAt": "2024-12-01T10:30:00Z"
}
```

### Paginated List Response
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

### Analytics Response Structure
```json
{
  "interactionTypeStats": [...],
  "statusStats": [...],
  "priorityStats": [...],
  "monthlyTrends": [...],
  "conversionFunnel": {
    "totalInteractions": 100,
    "completedInteractions": 85,
    "highInterest": 45,
    "converted": 12
  }
}
```

## Tips for Testing

1. **Authentication**: Make sure to set the `AUTH_TOKEN` environment variable with a valid JWT token
2. **Content-Type**: Always include `Content-Type: application/json` for POST/PATCH requests
3. **URL Encoding**: Use proper URL encoding for query parameters with special characters
4. **Date Formats**: Use ISO 8601 date format (YYYY-MM-DDTHH:mm:ssZ)
5. **Pagination**: Test with different page sizes to verify pagination works correctly
6. **Filtering**: Combine multiple filters to test complex query scenarios
7. **Error Handling**: Test with invalid data to verify proper error responses