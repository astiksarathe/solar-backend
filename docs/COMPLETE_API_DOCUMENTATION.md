# Solar Stack Backend - Complete API Documentation

This document contains all API endpoints with curl examples and response formats for easy frontend integration.

## Table of Contents
1. [Authentication APIs](#authentication-apis)
2. [User Management APIs](#user-management-apis)
3. [Consumer Data APIs](#consumer-data-apis)
4. [Consumer History APIs](#consumer-history-apis)
5. [Leads Management APIs](#leads-management-apis)
6. [Order Management APIs](#order-management-apis)
7. [Reminder System APIs](#reminder-system-apis)
8. [Audit System APIs](#audit-system-apis)
9. [Electricity Bill APIs](#electricity-bill-apis)

---

## Authentication APIs

### 1. Register User
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SALES_REPRESENTATIVE",
    "department": "SALES",
    "phoneNumber": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "671234567890abcdef123456",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SALES_REPRESENTATIVE",
    "department": "SALES",
    "phoneNumber": "+1234567890",
    "isActive": true,
    "createdAt": "2024-10-24T10:30:00.000Z"
  }
}
```

### 2. Login User
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "671234567890abcdef123456",
    "username": "john_doe",
    "email": "john@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "SALES_REPRESENTATIVE",
    "department": "SALES"
  }
}
```

### 3. Get Current User Profile
```bash
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "id": "671234567890abcdef123456",
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "role": "SALES_REPRESENTATIVE",
  "department": "SALES",
  "phoneNumber": "+1234567890",
  "isActive": true,
  "createdAt": "2024-10-24T10:30:00.000Z",
  "lastLogin": "2024-10-24T11:00:00.000Z"
}
```

---

## User Management APIs

### 1. Get All Users (Admin Only)
```bash
curl -X GET "http://localhost:3000/user?page=1&limit=10&role=SALES_REPRESENTATIVE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "users": [
    {
      "id": "671234567890abcdef123456",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "SALES_REPRESENTATIVE",
      "department": "SALES",
      "isActive": true,
      "createdAt": "2024-10-24T10:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 2. Update User
```bash
curl -X PATCH http://localhost:3000/user/671234567890abcdef123456 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John Updated",
    "phoneNumber": "+1234567891"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef123456",
  "username": "john_doe",
  "email": "john@example.com",
  "firstName": "John Updated",
  "lastName": "Doe",
  "phoneNumber": "+1234567891",
  "role": "SALES_REPRESENTATIVE",
  "department": "SALES",
  "isActive": true,
  "updatedAt": "2024-10-24T12:00:00.000Z"
}
```

---

## Consumer Data APIs

### 1. Create Consumer Data
```bash
curl -X POST http://localhost:3000/consumer-data \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Alice Johnson",
    "phoneNumber": "+1234567890",
    "email": "alice@example.com",
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "state": "IL",
      "zipCode": "62701",
      "country": "USA"
    },
    "propertyType": "RESIDENTIAL",
    "roofType": "SHINGLE",
    "estimatedBudget": 25000,
    "electricityBill": 150,
    "leadSource": "WEBSITE",
    "interestLevel": "HIGH"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef123457",
  "customerName": "Alice Johnson",
  "phoneNumber": "+1234567890",
  "email": "alice@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "propertyType": "RESIDENTIAL",
  "roofType": "SHINGLE",
  "estimatedBudget": 25000,
  "electricityBill": 150,
  "leadSource": "WEBSITE",
  "interestLevel": "HIGH",
  "status": "NEW",
  "createdAt": "2024-10-24T12:00:00.000Z",
  "updatedAt": "2024-10-24T12:00:00.000Z"
}
```

### 2. Get All Consumer Data
```bash
curl -X GET "http://localhost:3000/consumer-data?page=1&limit=10&interestLevel=HIGH&status=NEW" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef123457",
      "customerName": "Alice Johnson",
      "phoneNumber": "+1234567890",
      "email": "alice@example.com",
      "propertyType": "RESIDENTIAL",
      "estimatedBudget": 25000,
      "interestLevel": "HIGH",
      "status": "NEW",
      "createdAt": "2024-10-24T12:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Get Consumer Data by ID
```bash
curl -X GET http://localhost:3000/consumer-data/671234567890abcdef123457 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "id": "671234567890abcdef123457",
  "customerName": "Alice Johnson",
  "phoneNumber": "+1234567890",
  "email": "alice@example.com",
  "address": {
    "street": "123 Main St",
    "city": "Springfield",
    "state": "IL",
    "zipCode": "62701",
    "country": "USA"
  },
  "propertyType": "RESIDENTIAL",
  "roofType": "SHINGLE",
  "estimatedBudget": 25000,
  "electricityBill": 150,
  "leadSource": "WEBSITE",
  "interestLevel": "HIGH",
  "status": "NEW",
  "createdAt": "2024-10-24T12:00:00.000Z",
  "updatedAt": "2024-10-24T12:00:00.000Z"
}
```

---

## Consumer History APIs

### 1. Create Consumer History Entry
```bash
curl -X POST http://localhost:3000/consumer-history \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "consumerId": "671234567890abcdef123457",
    "interactionType": "PHONE_CALL",
    "description": "Initial consultation call",
    "scheduledAt": "2024-10-24T14:00:00.000Z",
    "assignedTo": "671234567890abcdef123456",
    "status": "PENDING",
    "priority": "HIGH",
    "expectedDuration": 30,
    "notes": "Customer interested in 5kW system"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef123458",
  "consumerId": "671234567890abcdef123457",
  "interactionType": "PHONE_CALL",
  "description": "Initial consultation call",
  "scheduledAt": "2024-10-24T14:00:00.000Z",
  "assignedTo": "671234567890abcdef123456",
  "status": "PENDING",
  "priority": "HIGH",
  "expectedDuration": 30,
  "notes": "Customer interested in 5kW system",
  "createdAt": "2024-10-24T12:30:00.000Z",
  "updatedAt": "2024-10-24T12:30:00.000Z"
}
```

### 2. Get All Consumer History
```bash
curl -X GET "http://localhost:3000/consumer-history?page=1&limit=10&status=PENDING&assignedTo=671234567890abcdef123456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef123458",
      "consumerId": "671234567890abcdef123457",
      "customerName": "Alice Johnson",
      "interactionType": "PHONE_CALL",
      "description": "Initial consultation call",
      "scheduledAt": "2024-10-24T14:00:00.000Z",
      "status": "PENDING",
      "priority": "HIGH",
      "assignedTo": "671234567890abcdef123456",
      "assignedToName": "John Doe"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Get Interaction Statistics
```bash
curl -X GET "http://localhost:3000/consumer-history/stats?fromDate=2024-10-01&toDate=2024-10-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "totalInteractions": 25,
  "completedInteractions": 20,
  "pendingInteractions": 3,
  "cancelledInteractions": 2,
  "averageDuration": 35,
  "interactionsByType": {
    "PHONE_CALL": 15,
    "EMAIL": 5,
    "SITE_VISIT": 3,
    "MEETING": 2
  },
  "interactionsByStatus": {
    "COMPLETED": 20,
    "PENDING": 3,
    "CANCELLED": 2
  }
}
```

### 4. Complete Interaction
```bash
curl -X PATCH http://localhost:3000/consumer-history/671234567890abcdef123458/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "outcome": "successful",
    "notes": "Customer agreed to site visit",
    "nextFollowUp": "2024-10-26T10:00:00.000Z",
    "interestLevel": "very_interested",
    "estimatedBudget": 28000,
    "updatedBy": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef123458",
  "status": "COMPLETED",
  "outcome": "successful",
  "notes": "Customer agreed to site visit",
  "nextFollowUp": "2024-10-26T10:00:00.000Z",
  "interestLevel": "very_interested",
  "estimatedBudget": 28000,
  "completedAt": "2024-10-24T14:30:00.000Z",
  "updatedBy": "671234567890abcdef123456"
}
```

---

## Leads Management APIs

### 1. Create Lead
```bash
curl -X POST http://localhost:3000/leads \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customerName": "Bob Smith",
    "phoneNumber": "+1234567891",
    "email": "bob@example.com",
    "address": {
      "street": "456 Oak Ave",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601"
    },
    "leadSource": "REFERRAL",
    "interestLevel": "MEDIUM",
    "estimatedBudget": 30000,
    "notes": "Referred by Alice Johnson",
    "assignedTo": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef123459",
  "customerName": "Bob Smith",
  "phoneNumber": "+1234567891",
  "email": "bob@example.com",
  "address": {
    "street": "456 Oak Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601"
  },
  "leadSource": "REFERRAL",
  "interestLevel": "MEDIUM",
  "estimatedBudget": 30000,
  "status": "NEW",
  "notes": "Referred by Alice Johnson",
  "assignedTo": "671234567890abcdef123456",
  "createdAt": "2024-10-24T13:00:00.000Z",
  "updatedAt": "2024-10-24T13:00:00.000Z"
}
```

### 2. Get All Leads
```bash
curl -X GET "http://localhost:3000/leads?page=1&limit=10&status=NEW&assignedTo=671234567890abcdef123456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef123459",
      "customerName": "Bob Smith",
      "phoneNumber": "+1234567891",
      "email": "bob@example.com",
      "leadSource": "REFERRAL",
      "interestLevel": "MEDIUM",
      "estimatedBudget": 30000,
      "status": "NEW",
      "assignedTo": "671234567890abcdef123456",
      "assignedToName": "John Doe",
      "createdAt": "2024-10-24T13:00:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Convert Lead to Customer
```bash
curl -X PATCH http://localhost:3000/leads/671234567890abcdef123459/convert \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "conversionNotes": "Customer signed contract for 6kW system",
    "convertedBy": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "lead": {
    "id": "671234567890abcdef123459",
    "status": "CONVERTED",
    "conversionDate": "2024-10-24T15:00:00.000Z",
    "conversionNotes": "Customer signed contract for 6kW system",
    "convertedBy": "671234567890abcdef123456"
  },
  "consumerData": {
    "id": "671234567890abcdef12345a",
    "customerName": "Bob Smith",
    "phoneNumber": "+1234567891",
    "email": "bob@example.com",
    "status": "ACTIVE"
  }
}
```

---

## Order Management APIs

### 1. Create Order
```bash
curl -X POST http://localhost:3000/orders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "671234567890abcdef12345a",
    "customerName": "Bob Smith",
    "customerEmail": "bob@example.com",
    "customerPhone": "+1234567891",
    "orderType": "SOLAR_INSTALLATION",
    "systemSize": 6.5,
    "totalAmount": 35000,
    "installationAddress": {
      "street": "456 Oak Ave",
      "city": "Chicago",
      "state": "IL",
      "zipCode": "60601"
    },
    "assignedTo": "671234567890abcdef123456",
    "expectedCompletionDate": "2024-11-15T00:00:00.000Z"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef12345b",
  "orderNumber": "ORD-2024-001",
  "customerId": "671234567890abcdef12345a",
  "customerName": "Bob Smith",
  "customerEmail": "bob@example.com",
  "customerPhone": "+1234567891",
  "orderType": "SOLAR_INSTALLATION",
  "systemSize": 6.5,
  "totalAmount": 35000,
  "status": "PENDING",
  "installationAddress": {
    "street": "456 Oak Ave",
    "city": "Chicago",
    "state": "IL",
    "zipCode": "60601"
  },
  "assignedTo": "671234567890abcdef123456",
  "expectedCompletionDate": "2024-11-15T00:00:00.000Z",
  "createdAt": "2024-10-24T15:30:00.000Z",
  "updatedAt": "2024-10-24T15:30:00.000Z"
}
```

### 2. Get All Orders
```bash
curl -X GET "http://localhost:3000/orders?page=1&limit=10&status=PENDING&assignedTo=671234567890abcdef123456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef12345b",
      "orderNumber": "ORD-2024-001",
      "customerName": "Bob Smith",
      "orderType": "SOLAR_INSTALLATION",
      "systemSize": 6.5,
      "totalAmount": 35000,
      "status": "PENDING",
      "assignedTo": "671234567890abcdef123456",
      "assignedToName": "John Doe",
      "expectedCompletionDate": "2024-11-15T00:00:00.000Z",
      "createdAt": "2024-10-24T15:30:00.000Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Update Order Status
```bash
curl -X PATCH http://localhost:3000/orders/671234567890abcdef12345b/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS",
    "notes": "Installation team assigned and materials ordered",
    "updatedBy": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef12345b",
  "status": "IN_PROGRESS",
  "statusHistory": [
    {
      "status": "PENDING",
      "timestamp": "2024-10-24T15:30:00.000Z",
      "updatedBy": "671234567890abcdef123456"
    },
    {
      "status": "IN_PROGRESS",
      "timestamp": "2024-10-24T16:00:00.000Z",
      "updatedBy": "671234567890abcdef123456",
      "notes": "Installation team assigned and materials ordered"
    }
  ],
  "updatedAt": "2024-10-24T16:00:00.000Z"
}
```

---

## Reminder System APIs

### 1. Create Reminder
```bash
curl -X POST http://localhost:3000/reminders \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Follow-up call with Bob Smith",
    "description": "Schedule site visit and finalize system specifications",
    "scheduledAt": "2024-10-26T10:00:00.000Z",
    "entityId": "671234567890abcdef12345a",
    "entityModel": "ConsumerData",
    "type": "FOLLOW_UP",
    "priority": "HIGH",
    "assignedTo": "671234567890abcdef123456",
    "department": "SALES",
    "isRecurring": false,
    "notifications": {
      "email": true,
      "sms": false,
      "push": true,
      "intervals": [15, 60]
    },
    "contact": {
      "name": "Bob Smith",
      "phone": "+1234567891",
      "email": "bob@example.com",
      "preferredContactMethod": "PHONE"
    }
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef12345c",
  "title": "Follow-up call with Bob Smith",
  "description": "Schedule site visit and finalize system specifications",
  "scheduledAt": "2024-10-26T10:00:00.000Z",
  "entityId": "671234567890abcdef12345a",
  "entityModel": "ConsumerData",
  "type": "FOLLOW_UP",
  "priority": "HIGH",
  "status": "PENDING",
  "assignedTo": "671234567890abcdef123456",
  "department": "SALES",
  "isRecurring": false,
  "notifications": {
    "email": true,
    "sms": false,
    "push": true,
    "intervals": [15, 60]
  },
  "contact": {
    "name": "Bob Smith",
    "phone": "+1234567891",
    "email": "bob@example.com",
    "preferredContactMethod": "PHONE"
  },
  "createdAt": "2024-10-24T16:30:00.000Z",
  "updatedAt": "2024-10-24T16:30:00.000Z"
}
```

### 2. Get All Reminders
```bash
curl -X GET "http://localhost:3000/reminders?page=1&limit=10&status=PENDING&assignedTo=671234567890abcdef123456&priority=HIGH" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef12345c",
      "title": "Follow-up call with Bob Smith",
      "description": "Schedule site visit and finalize system specifications",
      "scheduledAt": "2024-10-26T10:00:00.000Z",
      "type": "FOLLOW_UP",
      "priority": "HIGH",
      "status": "PENDING",
      "assignedTo": "671234567890abcdef123456",
      "assignedToName": "John Doe",
      "customerName": "Bob Smith",
      "contact": {
        "phone": "+1234567891",
        "email": "bob@example.com"
      }
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 3. Get Dashboard Summary
```bash
curl -X GET "http://localhost:3000/reminders/dashboard?assignedTo=671234567890abcdef123456" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "summary": {
    "total": 15,
    "pending": 8,
    "completed": 6,
    "overdue": 1,
    "todayReminders": 3,
    "thisWeekReminders": 12
  },
  "priorityBreakdown": {
    "LOW": 3,
    "MEDIUM": 7,
    "HIGH": 4,
    "URGENT": 1
  },
  "typeBreakdown": {
    "FOLLOW_UP": 8,
    "SITE_VISIT": 3,
    "DOCUMENTATION": 2,
    "PAYMENT": 1,
    "INSTALLATION": 1
  },
  "overdue": [
    {
      "id": "671234567890abcdef12345d",
      "title": "Overdue payment follow-up",
      "scheduledAt": "2024-10-23T09:00:00.000Z",
      "priority": "URGENT",
      "customerName": "Alice Johnson"
    }
  ],
  "today": [
    {
      "id": "671234567890abcdef12345c",
      "title": "Follow-up call with Bob Smith",
      "scheduledAt": "2024-10-26T10:00:00.000Z",
      "priority": "HIGH",
      "customerName": "Bob Smith"
    }
  ]
}
```

### 4. Complete Reminder
```bash
curl -X PATCH http://localhost:3000/reminders/671234567890abcdef12345c/complete \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "completionNotes": "Successfully scheduled site visit for Oct 28th",
    "outcome": "SUCCESSFUL",
    "qualityRating": 5,
    "customerFeedback": "Very helpful and professional",
    "nextAction": "SITE_VISIT",
    "followUpRequired": true,
    "followUpDate": "2024-10-28T14:00:00.000Z",
    "completedBy": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef12345c",
  "status": "COMPLETED",
  "completedAt": "2024-10-24T17:00:00.000Z",
  "completionNotes": "Successfully scheduled site visit for Oct 28th",
  "outcome": "SUCCESSFUL",
  "qualityRating": 5,
  "customerFeedback": "Very helpful and professional",
  "nextAction": "SITE_VISIT",
  "followUpRequired": true,
  "followUpDate": "2024-10-28T14:00:00.000Z",
  "completedBy": "671234567890abcdef123456",
  "actualDuration": 25
}
```

### 5. Add Communication Entry
```bash
curl -X POST http://localhost:3000/reminders/671234567890abcdef12345c/communication \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "type": "PHONE_CALL",
    "direction": "OUTBOUND",
    "duration": 25,
    "notes": "Discussed system specifications and scheduled site visit",
    "outcome": "SUCCESSFUL",
    "recordedBy": "671234567890abcdef123456"
  }'
```

**Response:**
```json
{
  "id": "671234567890abcdef12345c",
  "communicationHistory": [
    {
      "id": "671234567890abcdef12345e",
      "type": "PHONE_CALL",
      "direction": "OUTBOUND",
      "timestamp": "2024-10-24T17:00:00.000Z",
      "duration": 25,
      "notes": "Discussed system specifications and scheduled site visit",
      "outcome": "SUCCESSFUL",
      "recordedBy": "671234567890abcdef123456",
      "recordedByName": "John Doe"
    }
  ]
}
```

---

## Audit System APIs

### 1. Get Audit Logs
```bash
curl -X GET "http://localhost:3000/audit?page=1&limit=10&module=CONSUMER_HISTORY&category=DATA_CHANGE" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "data": [
    {
      "id": "671234567890abcdef12345f",
      "userId": "671234567890abcdef123456",
      "userName": "John Doe",
      "action": "CREATE",
      "entityType": "ConsumerHistory",
      "entityId": "671234567890abcdef123458",
      "module": "CONSUMER_HISTORY",
      "category": "DATA_CHANGE",
      "priority": "MEDIUM",
      "timestamp": "2024-10-24T12:30:00.000Z",
      "details": {
        "description": "Created new consumer history entry",
        "changes": {
          "interactionType": "PHONE_CALL",
          "status": "PENDING"
        }
      },
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1
}
```

### 2. Get Audit Statistics
```bash
curl -X GET "http://localhost:3000/audit/stats?fromDate=2024-10-01&toDate=2024-10-31" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "totalEntries": 150,
  "actionBreakdown": {
    "CREATE": 45,
    "UPDATE": 78,
    "DELETE": 12,
    "READ": 15
  },
  "moduleBreakdown": {
    "CONSUMER_HISTORY": 50,
    "LEADS": 35,
    "ORDERS": 25,
    "REMINDERS": 30,
    "AUTH": 10
  },
  "userActivity": [
    {
      "userId": "671234567890abcdef123456",
      "userName": "John Doe",
      "activityCount": 45
    }
  ],
  "dailyActivity": [
    {
      "date": "2024-10-24",
      "count": 25
    }
  ]
}
```

---

## Electricity Bill APIs

### 1. Calculate Bill
```bash
curl -X POST http://localhost:3000/electricity-bill/calculate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "monthlyUsage": 1200,
    "ratePerUnit": 0.12,
    "fixedCharges": 25,
    "taxes": 15,
    "region": "Illinois"
  }'
```

**Response:**
```json
{
  "monthlyUsage": 1200,
  "ratePerUnit": 0.12,
  "basicCharges": 144,
  "fixedCharges": 25,
  "taxes": 15,
  "totalAmount": 184,
  "region": "Illinois",
  "calculatedAt": "2024-10-24T18:00:00.000Z",
  "breakdown": {
    "energyCharges": 144,
    "fixedCharges": 25,
    "taxes": 15,
    "total": 184
  }
}
```

### 2. Get Bill History
```bash
curl -X GET "http://localhost:3000/electricity-bill/history?customerId=671234567890abcdef12345a" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**
```json
{
  "customerId": "671234567890abcdef12345a",
  "customerName": "Bob Smith",
  "bills": [
    {
      "id": "671234567890abcdef123460",
      "month": "2024-09",
      "monthlyUsage": 1150,
      "totalAmount": 178,
      "dueDate": "2024-10-15T00:00:00.000Z",
      "status": "PAID"
    },
    {
      "id": "671234567890abcdef123461",
      "month": "2024-10",
      "monthlyUsage": 1200,
      "totalAmount": 184,
      "dueDate": "2024-11-15T00:00:00.000Z",
      "status": "PENDING"
    }
  ],
  "averageMonthlyUsage": 1175,
  "averageMonthlyBill": 181
}
```

---

## Error Responses

All APIs follow a consistent error response format:

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "phoneNumber",
      "message": "Phone number is required"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Insufficient permissions",
  "error": "Forbidden"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found",
  "error": "Not Found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error",
  "error": "Internal Server Error"
}
```

---

## Authentication Headers

All protected endpoints require a Bearer token in the Authorization header:

```bash
-H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Rate Limiting

- **Public endpoints**: 100 requests per hour per IP
- **Authenticated endpoints**: 1000 requests per hour per user
- **Admin endpoints**: 500 requests per hour per admin user

## Base URL

- **Development**: `http://localhost:3000`
- **Staging**: `https://api-staging.solarstack.com`
- **Production**: `https://api.solarstack.com`

---

## Notes for Frontend Integration

1. **Token Management**: Store JWT tokens securely and refresh when needed
2. **Error Handling**: Implement consistent error handling for all API calls
3. **Loading States**: Show loading indicators during API calls
4. **Pagination**: Handle pagination for list endpoints
5. **Real-time Updates**: Consider implementing WebSocket connections for real-time updates
6. **Offline Support**: Cache frequently accessed data for offline functionality
7. **API Versioning**: All endpoints are currently v1, future versions will be prefixed

This documentation provides all the necessary information for frontend integration with comprehensive examples and response formats.