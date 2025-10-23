# Consumer History API Documentation

## Overview

The Consumer History API provides comprehensive management of customer interactions throughout the solar sales and installation process. This API supports tracking various interaction types, managing follow-ups, analytics, and bulk operations.

## Base URL
```
http://localhost:3000/consumer-history
```

## Authentication
All endpoints require JWT authentication via the `Authorization` header:
```
Authorization: Bearer <your_jwt_token>
```

## Data Models

### ConsumerHistory Entity

```typescript
{
  _id: string;                    // Unique identifier
  consumerId: string;             // Reference to consumer
  consumerNumber?: string;        // Human-readable consumer reference
  interactionType: InteractionType;
  status: InteractionStatus;
  title: string;                  // Brief title/subject
  description?: string;           // Detailed description
  notes?: string;                 // Additional notes
  scheduledDate?: Date;           // When interaction is scheduled
  completedDate?: Date;           // When interaction was completed
  duration?: number;              // Duration in minutes
  location?: string;              // Interaction location
  contactPerson?: string;         // Primary contact person
  phoneNumber?: string;           // Contact phone
  emailAddress?: string;          // Contact email
  interestLevel?: InterestLevel;  // Customer interest level
  nextFollowUp?: Date;            // Next follow-up date
  estimatedBudget?: number;       // Estimated budget in currency
  systemSize?: string;           // System size (e.g., "5kW")
  attachments?: string[];         // File attachments
  assignedTo?: string;            // Assigned user ID
  createdBy?: string;             // Creator user ID
  updatedBy?: string;             // Last updater user ID
  priority?: Priority;            // Interaction priority
  outcome?: Outcome;              // Interaction outcome
  tags?: string[];                // Categorization tags
  customFields?: Record<string, any>; // Additional custom data
  createdAt: Date;
  updatedAt: Date;
}
```

### Enums

#### InteractionType
```typescript
enum InteractionType {
  CALL = 'call',
  MEETING = 'meeting',
  SITE_VISIT = 'site_visit',
  EMAIL = 'email',
  WHATSAPP = 'whatsapp',
  FOLLOW_UP = 'follow_up',
  QUOTE_SENT = 'quote_sent',
  PROPOSAL_SENT = 'proposal_sent',
  SURVEY = 'survey',
  INSTALLATION_VISIT = 'installation_visit',
  MAINTENANCE = 'maintenance',
  COMPLAINT = 'complaint',
  PAYMENT_FOLLOW_UP = 'payment_follow_up'
}
```

#### InteractionStatus
```typescript
enum InteractionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  RESCHEDULED = 'rescheduled'
}
```

#### InterestLevel
```typescript
enum InterestLevel {
  NOT_INTERESTED = 'not_interested',
  LOW_INTEREST = 'low_interest',
  INTERESTED = 'interested',
  VERY_INTERESTED = 'very_interested',
  READY_TO_BUY = 'ready_to_buy',
  NEEDS_TIME = 'needs_time',
  PRICE_NEGOTIATION = 'price_negotiation',
  COMPARING_OPTIONS = 'comparing_options',
  BUDGET_CONSTRAINTS = 'budget_constraints'
}
```

#### Priority
```typescript
enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent'
}
```

#### Outcome
```typescript
enum Outcome {
  SUCCESSFUL = 'successful',
  NEEDS_FOLLOW_UP = 'needs_follow_up',
  REJECTED = 'rejected',
  POSTPONED = 'postponed',
  CONVERTED = 'converted',
  NO_RESPONSE = 'no_response',
  INFORMATION_GATHERING = 'information_gathering'
}
```

## Endpoints

### 1. Create Consumer History
**POST** `/consumer-history`

Creates a new consumer interaction record.

#### Request Body
```typescript
{
  consumerId: string;             // Required
  consumerNumber?: string;
  interactionType: InteractionType; // Required
  status?: InteractionStatus;     // Default: 'pending'
  title: string;                  // Required
  description?: string;
  notes?: string;
  scheduledDate?: string;         // ISO date string
  completedDate?: string;         // ISO date string
  duration?: number;
  location?: string;
  contactPerson?: string;
  phoneNumber?: string;
  emailAddress?: string;
  interestLevel?: InterestLevel;
  nextFollowUp?: string;          // ISO date string
  estimatedBudget?: number;
  systemSize?: string;
  attachments?: string[];
  assignedTo?: string;
  priority?: Priority;
  outcome?: Outcome;
  tags?: string[];
  customFields?: Record<string, any>;
}
```

#### Response
```typescript
{
  _id: string;
  // ... all consumer history fields
  createdAt: string;
  updatedAt: string;
}
```

### 2. Get Consumer History List
**GET** `/consumer-history`

Retrieves a paginated list of consumer interactions with advanced filtering.

#### Query Parameters
```typescript
{
  // Filtering
  consumerId?: string;
  consumerNumber?: string;
  interactionType?: string;       // Comma-separated values
  status?: string;                // Comma-separated values
  assignedTo?: string;
  priority?: string;              // Comma-separated values
  interestLevel?: string;         // Comma-separated values
  outcome?: string;               // Comma-separated values
  tags?: string;                  // Comma-separated values
  search?: string;                // Text search in title, description, notes
  
  // Date Filtering
  fromDate?: string;              // ISO date string
  toDate?: string;                // ISO date string
  followUpFromDate?: string;      // ISO date string
  followUpToDate?: string;        // ISO date string
  
  // Budget Filtering
  minBudget?: number;
  maxBudget?: number;
  
  // Pagination & Sorting
  page?: number;                  // Default: 1
  limit?: number;                 // Default: 10, Max: 100
  sortBy?: string;                // Default: 'createdAt'
  sortOrder?: 'asc' | 'desc';     // Default: 'desc'
}
```

#### Response
```typescript
{
  data: ConsumerHistory[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
```

### 3. Get Consumer History by ID
**GET** `/consumer-history/:id`

Retrieves a single consumer interaction by ID.

#### Response
```typescript
ConsumerHistory
```

### 4. Update Consumer History
**PATCH** `/consumer-history/:id`

Updates an existing consumer interaction.

#### Request Body
```typescript
Partial<CreateConsumerHistoryDto>
```

#### Response
```typescript
ConsumerHistory
```

### 5. Delete Consumer History
**DELETE** `/consumer-history/:id`

Deletes a consumer interaction record.

#### Response
```typescript
{
  message: string;
}
```

## Specialized Endpoints

### 6. Get Upcoming Interactions
**GET** `/consumer-history/upcoming`

Retrieves pending interactions scheduled within a specified timeframe.

#### Query Parameters
```typescript
{
  assignedTo?: string;            // Filter by assigned user
  days?: number;                  // Default: 7
}
```

#### Response
```typescript
ConsumerHistory[]
```

### 7. Get Overdue Interactions
**GET** `/consumer-history/overdue`

Retrieves pending interactions that are past their scheduled date.

#### Query Parameters
```typescript
{
  assignedTo?: string;            // Filter by assigned user
}
```

#### Response
```typescript
ConsumerHistory[]
```

### 8. Get Follow-ups Due
**GET** `/consumer-history/follow-ups-due`

Retrieves interactions with follow-ups due within a specified timeframe.

#### Query Parameters
```typescript
{
  assignedTo?: string;            // Filter by assigned user
  days?: number;                  // Default: 7
}
```

#### Response
```typescript
ConsumerHistory[]
```

### 9. Get Consumer Interaction Summary
**GET** `/consumer-history/consumer/:consumerId/summary`

Provides a comprehensive summary of all interactions for a specific consumer.

#### Response
```typescript
{
  totalInteractions: number;
  completedInteractions: number;
  pendingInteractions: number;
  lastInteraction?: ConsumerHistory;
  nextFollowUp?: ConsumerHistory;
  interestProgression: string[];    // Historical interest levels
  estimatedBudgetHistory: number[]; // Historical budget estimates
}
```

## Interaction Management

### 10. Complete Interaction
**PATCH** `/consumer-history/:id/complete`

Marks an interaction as completed with additional outcome data.

#### Request Body
```typescript
{
  outcome?: string;
  notes?: string;
  nextFollowUp?: string;          // ISO date string
  interestLevel?: string;
  estimatedBudget?: number;
  updatedBy: string;              // Required
}
```

#### Response
```typescript
ConsumerHistory
```

### 11. Reschedule Interaction
**PATCH** `/consumer-history/:id/reschedule`

Reschedules an interaction to a new date with a reason.

#### Request Body
```typescript
{
  newDate: string;                // Required, ISO date string
  reason: string;                 // Required
  updatedBy: string;              // Required
}
```

#### Response
```typescript
ConsumerHistory
```

## Analytics & Reporting

### 12. Get Advanced Analytics
**GET** `/consumer-history/analytics`

Provides comprehensive analytics and insights for consumer interactions.

#### Query Parameters
```typescript
{
  assignedTo?: string;            // Filter by assigned user
  fromDate?: string;              // ISO date string
  toDate?: string;                // ISO date string
}
```

#### Response
```typescript
{
  interactionTypeStats: Array<{
    _id: string;                  // Interaction type
    count: number;
  }>;
  statusStats: Array<{
    _id: string;                  // Status
    count: number;
  }>;
  priorityStats: Array<{
    _id: string;                  // Priority
    count: number;
  }>;
  interestLevelStats: Array<{
    _id: string;                  // Interest level
    count: number;
  }>;
  outcomeStats: Array<{
    _id: string;                  // Outcome
    count: number;
  }>;
  monthlyTrends: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
    completed: number;
  }>;
  averageBudgetByInterest: Array<{
    _id: string;                  // Interest level
    avgBudget: number;
    count: number;
  }>;
  conversionFunnel: {
    totalInteractions: number;
    completedInteractions: number;
    highInterest: number;
    converted: number;
  };
}
```

## Bulk Operations

### 13. Bulk Update Status
**PATCH** `/consumer-history/bulk-update`

Updates the status of multiple interactions in a single operation.

#### Request Body
```typescript
{
  ids: string[];                  // Required, array of interaction IDs
  status: string;                 // Required, valid status value
  updatedBy: string;              // Required
  notes?: string;
}
```

#### Response
```typescript
{
  updated: number;                // Number of successfully updated records
  errors: string[];               // Array of error messages for failed updates
}
```

## Error Responses

### Standard Error Format
```typescript
{
  statusCode: number;
  message: string | string[];
  error?: string;
}
```

### Common Error Codes
- **400 Bad Request**: Invalid request data or parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Consumer history record not found
- **422 Unprocessable Entity**: Validation errors
- **500 Internal Server Error**: Server-side errors

### Validation Error Example
```typescript
{
  statusCode: 400,
  message: [
    "title should not be empty",
    "interactionType must be a valid enum value",
    "estimatedBudget must be a positive number"
  ],
  error: "Bad Request"
}
```

## Usage Examples

### Creating a Follow-up Call
```typescript
POST /consumer-history
{
  "consumerId": "675b8e5a1234567890abcdef",
  "consumerNumber": "CONS-001",
  "interactionType": "follow_up",
  "title": "Follow-up on solar installation quote",
  "description": "Call to discuss the quote sent last week",
  "scheduledDate": "2024-12-10T14:00:00Z",
  "contactPerson": "John Doe",
  "phoneNumber": "+91 9876543210",
  "assignedTo": "675b8e5a1234567890abcd01",
  "priority": "high",
  "tags": ["quote_follow_up", "high_priority"]
}
```

### Filtering High-Priority Pending Items
```typescript
GET /consumer-history?priority=high,urgent&status=pending&assignedTo=675b8e5a1234567890abcd01
```

### Getting Weekly Dashboard Data
```typescript
GET /consumer-history/upcoming?assignedTo=675b8e5a1234567890abcd01&days=7
GET /consumer-history/overdue?assignedTo=675b8e5a1234567890abcd01
GET /consumer-history/follow-ups-due?assignedTo=675b8e5a1234567890abcd01&days=7
```

### Analytics for Sales Team
```typescript
GET /consumer-history/analytics?fromDate=2024-11-01T00:00:00Z&toDate=2024-11-30T23:59:59Z
```

## Best Practices

1. **Always include meaningful titles and descriptions** for better tracking and searching
2. **Use tags consistently** for better categorization and filtering
3. **Set appropriate priority levels** to help with task management
4. **Include contact information** for easier follow-up
5. **Update interest levels and budgets** as they change throughout the sales process
6. **Use custom fields** for industry-specific data that doesn't fit standard fields
7. **Schedule follow-ups** to maintain engagement momentum
8. **Complete interactions promptly** with outcomes for accurate reporting
9. **Use bulk operations** for efficiency when managing multiple records
10. **Leverage analytics endpoints** for insights and performance tracking

## Rate Limiting

The API implements rate limiting to ensure fair usage:
- **100 requests per minute** per authenticated user
- **1000 requests per hour** per authenticated user

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Changelog

### Version 1.0.0 (Current)
- Initial release with full CRUD operations
- Advanced filtering and search capabilities
- Analytics and reporting endpoints
- Bulk operations support
- Interaction management workflows