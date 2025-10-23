# Solar Stack Orders API - cURL Commands

## Authentication
# Replace YOUR_JWT_TOKEN with actual JWT token obtained from login
export AUTH_TOKEN="YOUR_JWT_TOKEN"
export BASE_URL="http://localhost:3000"

## 1. Create Order
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "orderNumber": "ORD-202412-0004",
    "consumerId": "675b8e5a1234567890abcdef",
    "leadId": "675b8e5a1234567890abcdff",
    "consumerNumber": "CONS-004",
    "customerName": "Test Customer",
    "phoneNumber": "+91 9876543213",
    "emailAddress": "test@example.com",
    "installationAddress": "Test Address, City, State 123456",
    "status": "draft",
    "customerType": "residential",
    "systemSize": "3kW",
    "systemCapacity": 3000,
    "numberOfPanels": 8,
    "panelWattage": 450,
    "inverterType": "String Inverter",
    "inverterCapacity": 3000,
    "batteryIncluded": false,
    "pricing": {
      "subtotal": 180000,
      "tax": 32400,
      "discount": 5000,
      "total": 207400,
      "advancePayment": 50000,
      "remainingAmount": 157400
    },
    "costBreakdown": [
      {
        "category": "panels",
        "itemName": "Solar Panel 450W",
        "quantity": 8,
        "unitPrice": 8000,
        "totalPrice": 64000,
        "taxRate": 18,
        "discountAmount": 2000
      },
      {
        "category": "inverter",
        "itemName": "3kW Inverter",
        "quantity": 1,
        "unitPrice": 30000,
        "totalPrice": 30000,
        "taxRate": 18,
        "discountAmount": 1000
      },
      {
        "category": "installation",
        "itemName": "Installation",
        "quantity": 1,
        "unitPrice": 50000,
        "totalPrice": 50000,
        "taxRate": 18,
        "discountAmount": 2000
      }
    ],
    "assignedTo": "675b8e5a1234567890abcd01",
    "createdBy": "675b8e5a1234567890abcd01",
    "orderDate": "2024-12-15T10:00:00Z"
  }'

## 2. Get All Orders (with pagination and filtering)
curl -X GET "$BASE_URL/orders?page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# With filters
curl -X GET "$BASE_URL/orders?status=confirmed&customerType=residential&search=Rajesh&page=1&limit=10" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 3. Get Order by ID
curl -X GET "$BASE_URL/orders/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 4. Update Order
curl -X PATCH "$BASE_URL/orders/675b8e5a1234567890abcdef" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "confirmed",
    "notes": "Order confirmed by customer",
    "updatedBy": "675b8e5a1234567890abcd01"
  }'

## 5. Update Order Status (with validation)
curl -X PATCH "$BASE_URL/orders/675b8e5a1234567890abcdef/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "in_progress",
    "updatedBy": "675b8e5a1234567890abcd01",
    "notes": "Started processing the order"
  }'

## 6. Update Payment Information
curl -X PATCH "$BASE_URL/orders/675b8e5a1234567890abcdef/payment" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "advancePayment": 100000,
    "discount": 10000
  }'

## 7. Update Installation Information
curl -X PATCH "$BASE_URL/orders/675b8e5a1234567890abcdef/installation" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "estimatedInstallationDate": "2024-12-20",
    "actualInstallationDate": "2024-12-20",
    "installationCompletionDate": "2024-12-22",
    "commissioningDate": "2024-12-23",
    "installationTeamLead": "Team Lead Name"
  }'

## 8. Get Order Timeline
curl -X GET "$BASE_URL/orders/675b8e5a1234567890abcdef/timeline" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 9. Get Order Statistics
curl -X GET "$BASE_URL/orders/stats" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# With filters
curl -X GET "$BASE_URL/orders/stats?assignedTo=675b8e5a1234567890abcd01&fromDate=2024-12-01&toDate=2024-12-31" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 10. Get Orders by Consumer ID
curl -X GET "$BASE_URL/orders/consumer/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 11. Get Orders by Lead ID
curl -X GET "$BASE_URL/orders/lead/675b8e5a1234567890abcdff" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 12. Generate Order Number
curl -X POST "$BASE_URL/orders/generate-order-number" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 13. Validate Order Data
curl -X POST "$BASE_URL/orders/675b8e5a1234567890abcdef/validate" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## 14. Delete Order
curl -X DELETE "$BASE_URL/orders/675b8e5a1234567890abcdef" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## Advanced Query Examples

# Search orders with multiple filters
curl -X GET "$BASE_URL/orders?status=confirmed&priority=high&customerType=commercial&minAmount=100000&maxAmount=1000000&fromDate=2024-12-01&toDate=2024-12-31&sortBy=orderDate&sortOrder=desc&page=1&limit=5" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Get orders by system capacity range
curl -X GET "$BASE_URL/orders?minSystemCapacity=5000&maxSystemCapacity=50000&customerType=residential" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Search orders by customer name or phone
curl -X GET "$BASE_URL/orders?search=Rajesh&customerName=Sharma" \
  -H "Authorization: Bearer $AUTH_TOKEN"

# Get orders with specific sorting
curl -X GET "$BASE_URL/orders?sortBy=pricing.total&sortOrder=desc&limit=20" \
  -H "Authorization: Bearer $AUTH_TOKEN"

## Status Transition Examples

# Draft to Pending Approval
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "pending_approval",
    "updatedBy": "USER_ID",
    "notes": "Submitted for management approval"
  }'

# Confirmed to In Progress
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "in_progress",
    "updatedBy": "USER_ID",
    "notes": "Work started on the order"
  }'

# Installation Scheduled
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "installation_scheduled",
    "updatedBy": "USER_ID",
    "notes": "Installation team assigned and date scheduled"
  }'

# Installation In Progress
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "installation_in_progress",
    "updatedBy": "USER_ID",
    "notes": "Installation work has begun on site"
  }'

# Installation Completed
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "installation_completed",
    "updatedBy": "USER_ID",
    "notes": "Physical installation work completed"
  }'

# Commissioning
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "commissioning",
    "updatedBy": "USER_ID",
    "notes": "System testing and commissioning in progress"
  }'

# Completed
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "completed",
    "updatedBy": "USER_ID",
    "notes": "Order completed successfully and system handed over"
  }'

# Put on Hold
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "on_hold",
    "updatedBy": "USER_ID",
    "notes": "Order put on hold due to customer request"
  }'

# Cancel Order
curl -X PATCH "$BASE_URL/orders/ORDER_ID/status" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "status": "cancelled",
    "updatedBy": "USER_ID",
    "notes": "Order cancelled by customer"
  }'