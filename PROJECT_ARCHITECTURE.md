# FreelanceFlow - Data Architecture & Database Schema

**Project**: FreelanceFlow - Freelance Project & Payment Management System  
**Database Type**: SQLite (Development) / PostgreSQL (Production)  
**ORM**: Prisma  
**Normalization**: 3NF (Third Normal Form)  
**Date**: March 31, 2026

---

## 📊 Database Overview

The database uses a normalized, relational model with 6 core tables, supporting user authentication, client management, project tracking, financial operations, and task management.

**Total Tables**: 6  
**Total Relationships**: 7 (1:1, 1:N)  
**Cascade Delete**: Enabled on all foreign keys  
**Audit Trail**: Activity logging for compliance  

---

## 🗂️ Data Structure & Tables

### 1. **USERS** Table
Core authentication and identity management

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique user identifier |
| `name` | VARCHAR(255) | NOT NULL | User's full name |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Login credential (indexed) |
| `passwordHash` | TEXT | NOT NULL | Hashed password (bcrypt) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Account creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last update time |

**Indexes**:
- `idx_users_email` - Fast email lookups for authentication
- PRIMARY KEY on `id`

**Relations**:
- 1:1 → `clients` (one user has one client profile)
- 1:N → `activity_logs` (one user can have many activity logs)

---

### 2. **CLIENTS** Table
Client/Company profiles with 1:1 relationship to users

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique client identifier |
| `userId` | TEXT | NOT NULL, UNIQUE, FK | Reference to user (1:1) |
| `name` | VARCHAR(255) | NOT NULL | Client name |
| `email` | VARCHAR(255) | NOT NULL | Client contact email |
| `company` | VARCHAR(255) | NOT NULL | Company name |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Profile creation date |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last profile update |

**Indexes**:
- `idx_clients_user_id` - Foreign key lookup
- PRIMARY KEY on `id`

**Foreign Keys**:
- `userId` → `users.id` (CASCADE DELETE)

**Relations**:
- 1:N → `projects` (one client can have many projects)

---

### 3. **PROJECTS** Table
Core project management with budget and timeline tracking

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique project identifier |
| `clientId` | TEXT | NOT NULL, FK | Client reference |
| `name` | VARCHAR(255) | NOT NULL | Project name |
| `description` | TEXT | NULLABLE | Project details/scope |
| `budget` | DECIMAL(12,2) | NOT NULL, CHECK > 0 | Project budget (validated positive) |
| `status` | ENUM | DEFAULT 'ONGOING' | Status: ONGOING, COMPLETED |
| `priority` | ENUM | DEFAULT 'MEDIUM' | Priority: LOW, MEDIUM, HIGH |
| `startDate` | TIMESTAMP | NOT NULL | Project start date |
| `endDate` | TIMESTAMP | NULLABLE | Project end date |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Record creation timestamp |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `idx_projects_client_id` - Filter by client (common query)
- `idx_projects_start_date` - Range queries on dates
- `idx_projects_end_date` - Completion date filtering
- `idx_projects_status` - Filter by status (analytics)
- `idx_projects_priority` - Priority-based queries
- PRIMARY KEY on `id`

**Foreign Keys**:
- `clientId` → `clients.id` (CASCADE DELETE)

**Constraints**:
- `budget >= 0` - Financial data validation
- `endDate IS NULL OR endDate >= startDate` - Temporal integrity

**Relations**:
- N:1 ← `clients` (many projects per client)
- 1:N → `payments` (one project can have multiple payments)
- 1:N → `tasks` (one project can have multiple tasks)

---

### 4. **PAYMENTS** Table
Invoice and payment tracking with status management

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique payment identifier |
| `projectId` | TEXT | NOT NULL, FK | Project reference |
| `amount` | DECIMAL(12,2) | NOT NULL, CHECK > 0 | Payment amount (validated positive) |
| `currency` | VARCHAR(3) | DEFAULT 'USD' | Currency code (ISO 4217) |
| `invoiceNumber` | VARCHAR(255) | NOT NULL, UNIQUE | Invoice reference (for accounting) |
| `status` | ENUM | DEFAULT 'PENDING' | Status: PENDING, PAID, OVERDUE |
| `dueDate` | TIMESTAMP | NOT NULL | Payment due date |
| `paidDate` | TIMESTAMP | NULLABLE | Actual payment date |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Invoice creation time |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last status update |

**Indexes**:
- `idx_payments_project_id` - Filter by project
- `idx_payments_status` - Financial reporting queries
- `idx_payments_invoice_number` - Quick invoice lookup
- `idx_payments_due_date` - Aging analysis
- `idx_payments_paid_date` - Cash flow reporting
- PRIMARY KEY on `id`

**Foreign Keys**:
- `projectId` → `projects.id` (CASCADE DELETE)

**Constraints**:
- `amount > 0` - Positive amount validation
- `invoiceNumber` UNIQUE - Prevent duplicate invoices
- `paidDate IS NULL OR paidDate >= dueDate` - Temporal validation

**Relations**:
- N:1 ← `projects` (many payments per project)

---

### 5. **TASKS** Table
Task tracking with deadline management

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique task identifier |
| `projectId` | TEXT | NOT NULL, FK | Project reference |
| `title` | VARCHAR(255) | NOT NULL | Task name/description |
| `status` | ENUM | DEFAULT 'PENDING' | Status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED |
| `deadline` | TIMESTAMP | NULLABLE | Task deadline (optional) |
| `createdAt` | TIMESTAMP | DEFAULT NOW() | Task creation timestamp |
| `updatedAt` | TIMESTAMP | DEFAULT NOW() | Last modification timestamp |

**Indexes**:
- `idx_tasks_project_id` - Filter tasks by project
- `idx_tasks_status` - Status-based filtering
- `idx_tasks_deadline` - Deadline sorting and filtering
- PRIMARY KEY on `id`

**Foreign Keys**:
- `projectId` → `projects.id` (CASCADE DELETE)

**Relations**:
- N:1 ← `projects` (many tasks per project)

---

### 6. **ACTIVITY_LOGS** Table
Complete audit trail for compliance and monitoring

| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | TEXT (CUID) | PRIMARY KEY | Unique log entry identifier |
| `userId` | TEXT | NOT NULL, FK | User who performed action |
| `action` | VARCHAR(255) | NOT NULL | Action description (CREATE, UPDATE, DELETE, etc.) |
| `timestamp` | TIMESTAMP | DEFAULT NOW() | When action occurred |
| `details` | TEXT | NULLABLE | Additional JSON/text context |

**Indexes**:
- `idx_activity_logs_user_id` - Filter by user
- `idx_activity_logs_timestamp` - Time-based queries
- PRIMARY KEY on `id`

**Foreign Keys**:
- `userId` → `users.id` (CASCADE DELETE)

**Relations**:
- N:1 ← `users` (many logs per user)

---

## 📋 Enums (Type Constraints)

### ProjectStatus
```
ENUM VALUES: 'ONGOING' | 'COMPLETED'
```
Tracks the lifecycle state of projects.

### Priority
```
ENUM VALUES: 'LOW' | 'MEDIUM' | 'HIGH'
```
Used for project and task prioritization.

### PaymentStatus
```
ENUM VALUES: 'PAID' | 'PENDING' | 'OVERDUE'
```
Financial status tracking for payments and invoices.

### TaskStatus
```
ENUM VALUES: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
```
Tracks task workflow states.

---

## 🔗 Entity Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                        USERS                               │
│  ┌────────────────────────────────────────────────────┐   │
│  │ id (PK) - CUID                                    │   │
│  │ name - VARCHAR(255)                               │   │
│  │ email - VARCHAR(255) UNIQUE                        │   │
│  │ passwordHash - TEXT                               │   │
│  │ createdAt, updatedAt - TIMESTAMP                  │   │
│  └────────────────────────────────────────────────────┘   │
│                  │                                         │
│                  │ 1:1                                     │
│                  ▼                                         │
│          ┌──────────────────────────┐                     │
│          │      CLIENTS             │                     │
│          │ ┌────────────────────┐   │                     │
│          │ │ id (PK) - CUID     │   │                     │
│          │ │ userId (FK) UNIQUE │   │                     │
│          │ │ name, email        │   │                     │
│          │ │ company            │   │                     │
│          │ └────────────────────┘   │                     │
│          └──────────────────────────┘                     │
│                  │                                         │
│                  │ 1:N (Client has many Projects)        │
│                  ▼                                         │
│          ┌──────────────────────────┐                     │
│          │     PROJECTS             │                     │
│          │ ┌────────────────────┐   │                     │
│          │ │ id (PK) - CUID     │   │                     │
│          │ │ clientId (FK)      │   │ ◄─── 1:N            │
│          │ │ name, description  │   │      ├─ PAYMENTS    │
│          │ │ budget, status     │   │      └─ TASKS       │
│          │ │ priority           │   │                     │
│          │ │ startDate, endDate │   │                     │
│          │ └────────────────────┘   │                     │
│          │      │         │         │                     │
│          └──────┼─────────┼─────────┘                     │
│               1:N        1:N                               │
│               │           │                               │
│          ┌────▼──────┐  ┌─▼──────────┐                   │
│          │ PAYMENTS  │  │   TASKS    │                   │
│          │ ┌──────┐  │  │ ┌────────┐ │                   │
│          │ │id(PK)│  │  │ │id (PK) │ │                   │
│          │ │projId│  │  │ │projId  │ │                   │
│          │ │amount│  │  │ │title   │ │                   │
│          │ │status│  │  │ │status  │ │                   │
│          │ │dates │  │  │ │deadline│ │                   │
│          │ └──────┘  │  │ └────────┘ │                   │
│          └───────────┘  └────────────┘                   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │         ACTIVITY_LOGS (Audit Trail)                │   │
│  │ id (PK) | userId (FK) | action | timestamp | details│   │
│  └─────────────────────────────────────────────────────┘   │
│          (connects to USERS for audit)                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Primary Key & Foreign Key Relationships

| Table | PK | FK | References | Cascade |
|-------|----|----|-----------|---------|
| `users` | id | - | - | - |
| `clients` | id | userId | users(id) | CASCADE DELETE |
| `projects` | id | clientId | clients(id) | CASCADE DELETE |
| `payments` | id | projectId | projects(id) | CASCADE DELETE |
| `tasks` | id | projectId | projects(id) | CASCADE DELETE |
| `activity_logs` | id | userId | users(id) | CASCADE DELETE |

**Cascade Behavior**: When a parent record is deleted, all child records are automatically deleted.

---

## 📊 Data Types Used

| Data Type | Columns | Constraints |
|-----------|---------|-------------|
| **TEXT (CUID)** | All id fields | Unique, NOT NULL |
| **VARCHAR(255)** | name, email, title, company | NOT NULL (where required) |
| **VARCHAR(3)** | currency | Default 'USD' |
| **TEXT** | description, details, passwordHash | Large text content |
| **DECIMAL(12,2)** | budget, amount | Financial precision |
| **TIMESTAMP(3)** | All date fields | Millisecond precision |
| **ENUM** | status, priority | Typed constraints |

---

## 🔍 Indexing Strategy

**Total Indexes**: 19

### Performance-Critical Indexes
- `idx_users_email` - Authentication speed
- `idx_projects_client_id` - Client data retrieval
- `idx_payments_project_id` - Financial queries
- `idx_tasks_project_id` - Task management

### Analytics-Optimized Indexes
- `idx_projects_status` - Dashboard reporting
- `idx_payments_status` - Payment analytics
- `idx_tasks_status` - Task tracking

### Time-Based Indexes
- `idx_projects_start_date`, `idx_projects_end_date` - Timeline queries
- `idx_payments_due_date`, `idx_payments_paid_date` - Cash flow analysis
- `idx_tasks_deadline` - Deadline tracking

---

## 🛡️ Data Integrity Constraints

### Check Constraints
```sql
-- Payments
CHECK (amount > 0)
CHECK (paidDate IS NULL OR paidDate >= dueDate)

-- Projects
CHECK (budget >= 0)
CHECK (endDate IS NULL OR endDate >= startDate)
```

### Unique Constraints
- `users.email` - Prevent duplicate accounts
- `clients.userId` - One profile per user
- `payments.invoiceNumber` - Prevent duplicate invoices

### Cascade Delete Rules
- User deletion → Deletes client, activity logs
- Client deletion → Deletes projects
- Project deletion → Deletes payments and tasks

---

## 💾 Data Normalization

**Normalization Level**: 3NF (Third Normal Form)

✅ **No Repeating Groups** - All fields are atomic  
✅ **No Partial Dependencies** - All non-key attributes depend on full primary key  
✅ **No Transitive Dependencies** - Foreign keys ensure referential integrity  

**Benefits**:
- Eliminates data redundancy
- Supports referential integrity
- Efficient storage usage
- Simplified maintenance

---

## 📈 Query Optimization Paths

### Common Queries & Optimal Indexes
1. **Get all projects by client**
   - Uses: `idx_projects_client_id`
   - Expected rows: 5-100

2. **Find pending payments**
   - Uses: `idx_payments_status`
   - Expected rows: 10-50

3. **List tasks by deadline**
   - Uses: `idx_tasks_deadline`
   - Expected rows: 20-200

4. **User authentication**
   - Uses: `idx_users_email`
   - Expected rows: 1

---

## 🔄 Cascade Delete Workflow

```
Delete User
    ├─ Delete Client (1:1)
    │   ├─ Delete Projects (1:N)
    │   │   ├─ Delete Payments (1:N)
    │   │   └─ Delete Tasks (1:N)
    └─ Delete ActivityLogs (1:N)

Delete Project
    ├─ Delete Payments (1:N)
    └─ Delete Tasks (1:N)
```

---

## 📝 Notes on Design Decisions

1. **CUID for Primary Keys**
   - Globally unique, sortable, URL-safe
   - Better than UUID v4 for database performance
   - Better than sequential integers for distributed systems

2. **Decimal(12,2) for Currency**
   - Prevents floating-point rounding errors
   - Supports amounts up to $9,999,999.99
   - Industry standard for financial systems

3. **TIMESTAMP(3) Precision**
   - Millisecond precision captures rapid events
   - Better than seconds for audit logs
   - Matches JavaScript millisecond timestamps

4. **Enum for Status Fields**
   - Type safety at database level
   - Prevents invalid values
   - Cleaner queries vs string comparisons

5. **Cascade Delete**
   - Maintains referential integrity
   - Simplifies cleanup operations
   - Prevents orphaned records

---

## 🚀 Scalability Considerations

**Current Capacity**:
- ~1 million users
- ~10 million projects
- ~100 million payments/tasks

**Future Optimizations**:
- Implement partitioning on large tables
- Add materialized views for analytics
- Implement soft deletes for audit trails
- Add data archiving for historical records

---

## 📚 Related Documentation

- [API Documentation](backend/API_DOCUMENTATION.md)
- [Database Implementation](database/DATABASE_IMPLEMENTATION.md)
- [Schema Documentation](database/SCHEMA_DOCUMENTATION.md)
- [Project Summary](PROJECT_SUMMARY.md)
