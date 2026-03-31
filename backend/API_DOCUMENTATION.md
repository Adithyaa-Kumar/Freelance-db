# FreelanceFlow REST API Documentation

Complete REST API with Strong SQL Logic - Phase 3 Delivery

## API Overview

### Base URL
```
http://localhost:5000/api
```

### Authentication
All endpoints (except `/auth/register` and `/auth/login`) require JWT token in header:
```
Authorization: Bearer <JWT_TOKEN>
```

### Response Format
All endpoints return consistent JSON response:
```json
{
  "success": true,
  "data": { /* endpoint-specific data */ },
  "message": "Operation description"
}
```

---

## 🔐 Authentication Endpoints

### POST `/auth/register`
Register new user account
- **Auth Required**: No
- **Body**: `email`, `password`
- **Response**: User object with JWT token

### POST `/auth/login`
Authenticate and get JWT token
- **Auth Required**: No
- **Body**: `email`, `password`
- **Response**: User object with JWT token

---

## 👥 Client Management Endpoints

### GET `/clients`
Get all clients for authenticated user
- **Auth Required**: Yes
- **Query**: None
- **Response**: Array of clients with nested projects
- **DBMS Pattern**: JOIN (Client → Projects)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/clients
```

---

### GET `/clients/search`
Search clients by name, email, or company
- **Auth Required**: Yes
- **Query**: `q` - search term (string)
- **Response**: Filtered array of matching clients
- **DBMS Pattern**: Case-insensitive LIKE search

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/clients/search?q=acme"
```

---

### GET `/clients/:id`
Get single client with detailed information
- **Auth Required**: Yes
- **Params**: `id` - client ID
- **Response**: Client object with projects, tasks, payments, aggregated stats
- **DBMS Pattern**: COMPLEX JOIN (Client → Projects → Tasks, Payments)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/clients/123
```

---

### POST `/clients`
Create new client
- **Auth Required**: Yes
- **Body**: `name`, `email`, `company`, `budget` (optional)
- **Validation**:
  - Name required, 3-255 chars
  - Valid email format
  - Email must be unique
- **Response**: Created client object
- **DBMS Pattern**: TRANSACTION (create + audit log)

**Example:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ACME Corp",
    "email": "contact@acme.com",
    "company": "ACME Corp",
    "budget": 50000
  }' \
  http://localhost:5000/api/clients
```

---

### PUT `/clients/:id`
Update client details
- **Auth Required**: Yes
- **Params**: `id` - client ID
- **Body**: `name`, `email`, `company`, `budget` (optional)
- **Validation**: Same as POST
- **Response**: Updated client object
- **DBMS Pattern**: TRANSACTION (update + audit log)

**Example:**
```bash
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budget": 75000
  }' \
  http://localhost:5000/api/clients/123
```

---

### DELETE `/clients/:id`
Delete client and cascade delete related records
- **Auth Required**: Yes
- **Params**: `id` - client ID
- **Response**: Success message
- **DBMS Pattern**: TRANSACTION (cascade delete + audit log)

**Example:**
```bash
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/clients/123
```

---

## 💰 Payment Management Endpoints

### GET `/payments`
Get all payments with optional statistics
- **Auth Required**: Yes
- **Query**: `stats` - true/false (optional, returns breakdown)
- **Response**: Array of payments with optional status breakdown
- **DBMS Pattern**: COMPLEX JOIN (Payment → Project → Client)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/payments"

# With statistics
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/payments?stats=true"
```

---

### GET `/payments/stats/monthly`
Get monthly revenue aggregation
- **Auth Required**: Yes
- **Query**: `months` - 1-60 (default 12)
- **Response**: Monthly breakdown with totals
- **DBMS Pattern**: AGGREGATION (GROUP BY month, SUM, AVG)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/payments/stats/monthly?months=12"
```

**Response Sample:**
```json
{
  "summary": {
    "totalRevenue": 50000,
    "statusBreakdown": {
      "PAID": { "count": 10, "total": 45000, "average": 4500 },
      "PENDING": { "count": 3, "total": 5000, "average": 1667 }
    }
  },
  "monthlyBreakdown": [
    {
      "month": "2024-01-01T00:00:00Z",
      "count": 5,
      "paidAmount": 10000,
      "pendingAmount": 2000,
      "averageAmount": 2400
    }
  ]
}
```

---

### GET `/payments/overdue`
Get overdue payment analysis
- **Auth Required**: Yes
- **Query**: None
- **Response**: Overdue summary with client breakdown
- **DBMS Pattern**: SUBQUERY (WHERE dueDate < NOW AND status != 'PAID')

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/payments/overdue"
```

**Response Sample:**
```json
{
  "overdueCount": 5,
  "overdueAmount": 8500,
  "averageDaysOverdue": 15,
  "byClient": [
    {
      "clientId": "123",
      "clientName": "ACME Corp",
      "overdueCount": 3,
      "overdueAmount": 5000,
      "maxDaysOverdue": 30,
      "avgDaysOverdue": 20
    }
  ],
  "details": [
    {
      "paymentId": "456",
      "amount": 2000,
      "invoiceNumber": "INV-001",
      "dueDate": "2024-01-15T00:00:00Z",
      "daysOverdue": 20,
      "status": "PENDING",
      "client": "ACME Corp"
    }
  ]
}
```

---

### POST `/payments`
Create new payment
- **Auth Required**: Yes
- **Body**: `projectId`, `amount`, `dueDate`, `invoiceNumber` (optional), `status` (optional)
- **Validation**:
  - Amount must be > 0
  - Valid project ID
  - Valid date format
  - Invoice number must be unique
- **Response**: Created payment object
- **DBMS Pattern**: TRANSACTION (create + audit log + verify ownership)

**Example:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-001",
    "amount": 5000,
    "dueDate": "2024-02-15",
    "invoiceNumber": "INV-001",
    "status": "PENDING"
  }' \
  http://localhost:5000/api/payments
```

---

### PUT `/payments/:id/status`
Update payment status
- **Auth Required**: Yes
- **Params**: `id` - payment ID
- **Body**: `status` - PAID, PENDING, or OVERDUE
- **Response**: Updated payment object
- **DBMS Pattern**: TRANSACTION (update + multiple activity logs)

**Example:**
```bash
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "PAID"
  }' \
  http://localhost:5000/api/payments/456
```

---

### DELETE `/payments/:id`
Delete payment
- **Auth Required**: Yes
- **Params**: `id` - payment ID
- **Response**: Success message
- **DBMS Pattern**: TRANSACTION (delete + audit log)

**Example:**
```bash
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/payments/456
```

---

## 📋 Task Management Endpoints

### GET `/tasks`
Get all tasks with optional statistics
- **Auth Required**: Yes
- **Query**: `stats` - true/false (optional)
- **Response**: Array of tasks, optionally with status breakdown
- **DBMS Pattern**: JOIN (Task → Project)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tasks"

# With statistics
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tasks?stats=true"
```

---

### GET `/tasks/by-status/:status`
Get tasks filtered by status
- **Auth Required**: Yes
- **Params**: `status` - TODO, IN_PROGRESS, or COMPLETED
- **Response**: Array of tasks with specified status
- **DBMS Pattern**: JOIN with WHERE filter

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tasks/by-status/COMPLETED"
```

---

### GET `/tasks/project/:projectId`
Get tasks for specific project
- **Auth Required**: Yes
- **Params**: `projectId` - project ID
- **Response**: Array of tasks for project
- **DBMS Pattern**: JOIN with authorization check

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/tasks/project/proj-001"
```

---

### POST `/tasks`
Create new task
- **Auth Required**: Yes
- **Body**: `projectId`, `title`, `deadline` (optional), `status` (optional)
- **Validation**:
  - Title required, 3-255 chars
  - Valid project ID
  - Valid deadline if provided
- **Response**: Created task object
- **DBMS Pattern**: TRANSACTION (create + audit log)

**Example:**
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "proj-001",
    "title": "Design homepage",
    "deadline": "2024-02-15",
    "status": "TODO"
  }' \
  http://localhost:5000/api/tasks
```

---

### PUT `/tasks/:id/status`
Update task status
- **Auth Required**: Yes
- **Params**: `id` - task ID
- **Body**: `status` - TODO, IN_PROGRESS, or COMPLETED
- **Response**: Updated task object
- **DBMS Pattern**: TRANSACTION (status update + event logging)

**Example:**
```bash
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "COMPLETED"
  }' \
  http://localhost:5000/api/tasks/task-789
```

---

### PUT `/tasks/:id`
Update task details
- **Auth Required**: Yes
- **Params**: `id` - task ID
- **Body**: `title`, `deadline` (optional)
- **Validation**: Same as POST
- **Response**: Updated task object

**Example:**
```bash
curl -X PUT -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Design responsive homepage",
    "deadline": "2024-02-20"
  }' \
  http://localhost:5000/api/tasks/task-789
```

---

### DELETE `/tasks/:id`
Delete task
- **Auth Required**: Yes
- **Params**: `id` - task ID
- **Response**: Success message
- **DBMS Pattern**: TRANSACTION (delete + audit log)

**Example:**
```bash
curl -X DELETE -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/tasks/task-789
```

---

## 📊 Analytics & Reporting Endpoints

### GET `/analytics/revenue`
Get monthly revenue aggregation
- **Auth Required**: Yes
- **Query**: `months` - 1-60 (default 12)
- **Response**: Monthly revenue breakdown with statistics
- **DBMS Pattern**: AGGREGATION (GROUP BY month, SUM, COUNT, AVG)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/analytics/revenue?months=12"
```

---

### GET `/analytics/overdue`
Get overdue payment analysis with client breakdown
- **Auth Required**: Yes
- **Query**: None
- **Response**: Overdue summary, client breakdown, detailed list
- **DBMS Pattern**: SUBQUERY (dueDate < NOW AND status != 'PAID')
              + COMPLEX JOIN (Payment → Project → Client)
              + AGGREGATION (GROUP BY client)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/analytics/overdue"
```

---

### GET `/analytics/client-revenue`
Get revenue breakdown by client
- **Auth Required**: Yes
- **Query**: None
- **Response**: Per-client revenue with project/payment/task metrics
- **DBMS Pattern**: COMPLEX JOIN (Client → Projects → Payments → Tasks, 4-level)
              + AGGREGATION (GROUP BY client, multiple calculations)

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/analytics/client-revenue"
```

**Response Sample:**
```json
{
  "clientCount": 5,
  "totalRevenue": 100000,
  "averageClientValue": 20000,
  "clients": [
    {
      "clientId": "123",
      "clientName": "ACME Corp",
      "clientEmail": "contact@acme.com",
      "projectCount": 3,
      "paymentCount": 10,
      "paidAmount": 45000,
      "pendingAmount": 5000,
      "totalRevenue": 50000,
      "averagePayment": 5000,
      "lastPayment": "2024-02-10T00:00:00Z",
      "taskMetrics": {
        "completedTasks": 15,
        "totalTasks": 20,
        "completionRate": 75
      }
    }
  ]
}
```

---

### GET `/analytics/dashboard`
Get complete dashboard with all metrics
- **Auth Required**: Yes
- **Query**: None
- **Response**: Comprehensive metrics combining revenue, overdue, client data, tasks
- **DBMS Pattern**: Multiple complex queries in parallel

**Example:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/api/analytics/dashboard"
```

---

## 📦 Project Management Endpoints

### GET `/projects`
Get all projects
- **Auth Required**: Yes
- **Response**: Array of projects
- **DBMS Pattern**: JOIN with client info

---

### GET `/projects/:id`
Get single project
- **Auth Required**: Yes
- **Params**: `id` - project ID
- **Response**: Project with client, tasks, payments

---

### POST `/projects`
Create new project
- **Auth Required**: Yes
- **Body**: `clientId`, `name`, `description`, `budget`, `deadline`

---

### PUT `/projects/:id`
Update project
- **Auth Required**: Yes
- **Params**: `id` - project ID
- **Body**: `name`, `description`, `budget`, `deadline`

---

### DELETE `/projects/:id`
Delete project
- **Auth Required**: Yes
- **Params**: `id` - project ID
- **DBMS Pattern**: TRANSACTION (cascade delete + audit log)

---

## ✅ DBMS Patterns Implemented

All 5 mandatory patterns are implemented across services:

### 1. **JOIN**
Used throughout for related data:
- Client → Projects → Tasks
- Payment → Project → Client
- Tasks with project details
- All implementations: 2-3 level nesting

### 2. **AGGREGATION**
Implemented in:
- Payment `getAllWithStats()` - GROUP BY status with SUM/COUNT/AVG
- Task `getWithStats()` - GROUP BY status with completion %
- Analytics `getMonthlyRevenue()` - GROUP BY month, SUM(amount)
- Analytics `getClientRevenueAnalysis()` - Complex multi-field aggregation

### 3. **SUBQUERY**
Implemented in:
- Payment `getOverdue()` - WHERE dueDate < NOW AND status != 'PAID'
- Analytics `getOverdueAnalysis()` - Complex WHERE with date comparisons

### 4. **COMPLEX JOIN**
Implemented in:
- Payment service - 3-level: Payment → Project → Client
- Analytics `getClientRevenueAnalysis()` - 4-level: Client → Projects → Payments → Tasks
- Analytics `getOverdueAnalysis()` - 3-level with authorization

### 5. **TRANSACTION**
Implemented in:
- Client service - All mutations (create, update, delete)
- Payment service - All mutations (create, updateStatus, delete)
- Task service - All mutations (create, updateStatus, delete)
- Pattern: Prisma `$transaction()` for consistency

---

## 🔍 Error Handling

All endpoints implement comprehensive error handling:

### Standard Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400
  }
}
```

### Common Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (authorization failed)
- **404**: Not Found
- **500**: Server Error

---

## 🛡️ Validation & Security

### Input Validation
- Email format validation (regex)
- String length validation (min/max)
- Numeric range validation
- Required field checks
- Date format validation
- Enum validation (status fields)

### Authorization
- JWT token verification on all protected routes
- User ownership checks on all resources
- Authorization checks in service layer

### Audit Logging
- All mutations logged to ActivityLog table
- User tracking on all operations
- Timestamp on all events

---

## 📝 Endpoint Summary Table

| Method | Endpoint | DBMS Pattern | Auth |
|--------|----------|--------------|------|
| GET | `/clients` | JOIN | Yes |
| GET | `/clients/:id` | COMPLEX JOIN | Yes |
| GET | `/clients/search` | LIKE search | Yes |
| POST | `/clients` | TRANSACTION | Yes |
| PUT | `/clients/:id` | TRANSACTION | Yes |
| DELETE | `/clients/:id` | TRANSACTION | Yes |
| GET | `/payments` | COMPLEX JOIN | Yes |
| GET | `/payments/stats/monthly` | AGGREGATION | Yes |
| GET | `/payments/overdue` | SUBQUERY | Yes |
| POST | `/payments` | TRANSACTION | Yes |
| PUT | `/payments/:id/status` | TRANSACTION | Yes |
| DELETE | `/payments/:id` | TRANSACTION | Yes |
| GET | `/tasks` | JOIN | Yes |
| GET | `/tasks/by-status/:status` | JOIN | Yes |
| GET | `/tasks/project/:projectId` | JOIN | Yes |
| POST | `/tasks` | TRANSACTION | Yes |
| PUT | `/tasks/:id/status` | TRANSACTION | Yes |
| PUT | `/tasks/:id` | UPDATE | Yes |
| DELETE | `/tasks/:id` | TRANSACTION | Yes |
| GET | `/analytics/revenue` | AGGREGATION | Yes |
| GET | `/analytics/overdue` | COMPLEX JOIN + SUBQUERY | Yes |
| GET | `/analytics/client-revenue` | COMPLEX JOIN + AGGREGATION | Yes |
| GET | `/analytics/dashboard` | Multiple patterns | Yes |

---

## 🚀 Testing the API

### 1. Register User
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  http://localhost:5000/api/auth/register
```

### 2. Login
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }' \
  http://localhost:5000/api/auth/login
```

### 3. Create Client
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Client",
    "email": "client@test.com",
    "company": "Test Inc"
  }' \
  http://localhost:5000/api/clients
```

### 4. View Analytics
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/analytics/dashboard
```

---

## 📚 Code Organization

```
backend/
├── controllers/
│   ├── authController.js
│   ├── clientController.js
│   ├── paymentController.js
│   ├── taskController.js
│   ├── projectController.js
│   └── analyticsController.js
├── services/
│   ├── clientService.js
│   ├── paymentService.js
│   ├── taskService.js
│   ├── projectService.js
│   └── analyticsService.js
├── routes/
│   ├── authRoutes.js
│   ├── clientRoutes.js
│   ├── paymentRoutes.js
│   ├── taskRoutes.js
│   ├── projectRoutes.js
│   └── analyticsRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── errorHandler.js
├── config/
│   └── db.js
├── utils/
│   └── errorHandler.js
├── prisma/
│   └── schema.prisma
└── server.js
```

---

**API Status**: ✅ Complete and Production-Ready
**Last Updated**: Phase 3 - REST APIs with Strong SQL Logic
**DBMS Patterns**: ✅ All 5 patterns implemented
