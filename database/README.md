# Production-Grade PostgreSQL Database Setup

## Quick Summary

This directory contains a **production-ready 3NF PostgreSQL database** design built with Prisma ORM.

**Key Features**:
- ✅ Normalized 3NF schema (eliminates redundancy)
- ✅ 6 core tables with cascade deletes
- ✅ Strategic indexing for performance
- ✅ 9 advanced analytics views
- ✅ Complete audit trail logging
- ✅ ACID compliance and referential integrity

---

## 📁 Files Overview

| File | Purpose |
|------|---------|
| `schema.sql` | Raw PostgreSQL DDL for manual setup |
| `views.sql` | 9 materialized views for analytics |
| `MIGRATION.md` | Step-by-step migration guide |
| `SCHEMA_DOCUMENTATION.md` | Detailed schema documentation |
| `seed.sql` | Optional SQL seeding data |

---

## 📊 Database Schema

### Tables (6)

1. **users** - Authentication and identity (3 test users)
2. **clients** - Company profiles (1:1 with users)
3. **projects** - Project management (4 test projects)
4. **payments** - Financial tracking (7 test payments)
5. **tasks** - Task management (12 test tasks)
6. **activity_logs** - Audit trail (complete activity history)

### Views (9)

| View | Purpose |
|------|---------|
| `revenue_summary` | Total paid revenue per project |
| `project_financial_summary` | Complete financial overview |
| `overdue_payments` | Collections monitoring |
| `upcoming_payments` | Cash flow forecasting |
| `user_activity_summary` | User engagement metrics |
| `project_performance` | Multi-dimensional analytics |
| `client_revenue` | Client profitability |
| `task_status_distribution` | Operational dashboard |
| `dashboard_summary` | Executive KPI snapshot |

---

## 🚀 Quick Setup

### Option 1: Using Prisma (Recommended)

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Update DATABASE_URL with your PostgreSQL connection

# 3. Create migration
npx prisma migrate dev --name init_production_schema

# 4. Create views
psql freelanceflow < ../database/views.sql

# 5. Seed sample data
npm run prisma:seed
```

### Option 2: Manual SQL

```bash
# 1. Create database
createdb freelanceflow

# 2. Apply schema
psql freelanceflow < schema.sql

# 3. Create views
psql freelanceflow < views.sql

# 4. Seed data (optional)
psql freelanceflow < seed.sql
```

### Option 3: Docker Compose

```bash
# PostgreSQL container with volume
docker-compose up -d

# Then run Prisma migrations
cd backend
npx prisma migrate dev
```

---

## 🔍 Schema At a Glance

```
┌────────────────┐
│ USERS          │ ◄─── 3 test users
├────────────────┤
│ id (PK)        │
│ name           │
│ email (UNIQUE) │
│ password_hash  │
└────┬───────────┘
     │ 1:1
     ▼
┌────────────────┐
│ CLIENTS        │ ◄─── 3 clients
├────────────────┤
│ id (PK)        │
│ user_id (FK)   │
│ company        │
└────┬───────────┘
     │ 1:N
     ▼
┌────────────────┐
│ PROJECTS       │ ◄─── 4 projects
├────────────────┤
│ id (PK)        │
│ client_id (FK) │
│ budget         │
│ status         │
└────┬──────┬────┘
     │      │
  1:N│      │1:N
     ▼      ▼
┌──────┐  ┌───────┐
│PMNTS │  │TASKS  │
└──────┘  └───────┘
```

---

## 📋 Test Data Included

### Users (3)
```
1. Alice Johnson (alice@acmecorp.com)
2. Bob Smith (bob@techstartup.io)
3. Carol Davis (carol@globalenterprises.com)
```

### Projects (4)
```
1. Website Redesign (COMPLETED) - $15,000
2. Mobile App (ONGOING) - $45,000
3. Database Migration (ONGOING) - $8,500
4. Enterprise Integration (ONGOING) - $65,000
```

### Payments (7)
```
- 2 PAID ($30,000 total revenue)
- 4 PENDING ($63,500 awaiting payment)
- 1 OVERDUE ($32,500 past due)
```

### Tasks (12)
```
- 3 COMPLETED
- 3 IN_PROGRESS
- 6 PENDING
```

---

## 💻 Database Credentials

**Default (from docker-compose.yml)**:
```
Host: localhost
Port: 5432
Username: freelancer
Password: password123
Database: freelanceflow
```

---

## 📈 Query Examples

### Get Revenue Summary
```sql
SELECT * FROM revenue_summary ORDER BY total_revenue DESC;
```

### Find Overdue Payments
```sql
SELECT * FROM overdue_payments;
```

### Project Performance
```sql
SELECT * FROM project_performance WHERE project_status = 'ONGOING';
```

### User Activity
```sql
SELECT * FROM user_activity_summary ORDER BY last_activity DESC;
```

### Dashboard Total
```sql
SELECT * FROM dashboard_summary;
```

### Financial Summary for a Project
```sql
SELECT * FROM project_financial_summary WHERE project_id = 'proj_123';
```

---

## 🔐 Cascading Deletes

When you delete a record at the top level:

```
DELETE FROM users WHERE id = 'user_1'
  ↓ Deletes:
  - clients (where user_id = 'user_1')
    - projects (where client_id)
      - payments
      - tasks
  - activity_logs (where user_id)
```

⚠️ **Use with caution in production!**

---

## 📊 Performance Indexes

**Total Indexes**: 10 strategic indexes

| Table | Indexes | Purpose |
|-------|---------|---------|
| users | email | Fast authentication |
| clients | user_id | Profile lookup |
| projects | client_id, status | Query filtering |
| payments | project_id, status, due_date | Financial reports |
| tasks | project_id, status, deadline | Operational queries |
| activity_logs | user_id, timestamp | Audit queries |

**Result**: O(log n) for most queries

---

## 🧪 Testing the Database

### Verify Installation

```bash
# Connect and test
psql -U freelancer -d freelanceflow

# List tables
\dt

# List views
\dv

# Count records
SELECT 'users' as table, COUNT(*) FROM users
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;
```

### Test Relationships

```sql
-- Get all projects for a client
SELECT p.* FROM projects p
JOIN clients c ON p.client_id = c.id
WHERE c.company = 'ACME Corporation';

-- Get all payments for a project
SELECT pay.* FROM payments pay
JOIN projects p ON pay.project_id = p.id
WHERE p.name = 'Website Redesign';

-- Revenue analysis
SELECT 
  p.name,
  SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END) as paid,
  SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END) as pending
FROM projects p
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY p.name;
```

---

## 🔧 Maintenance

### Backup Database

```bash
# Full backup
pg_dump freelanceflow > backup_freelanceflow_$(date +%Y%m%d).sql

# Restore from backup
psql freelanceflow < backup_freelanceflow_20260330.sql
```

### Optimize Performance

```bash
-- Analyze tables for query planning
ANALYZE;

-- Reindex if fragmented
REINDEX DATABASE freelanceflow;

-- Vacuum for cleanup
VACUUM ANALYZE;
```

### Check Table Sizes

```sql
SELECT 
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📚 Documentation Files

1. **MIGRATION.md** - Complete migration guide (SQL, data transforms)
2. **SCHEMA_DOCUMENTATION.md** - Detailed schema reference (3NF analysis, indexes, etc.)
3. **README.md** - This file (quick reference)

---

## 🛠️ Prisma Commands

```bash
# Generate migration from schema changes
npx prisma migrate dev --name <description>

# View the schema visually
npx prisma studio

# Push changes directly (dev only)
npx prisma db push

# Generate Prisma client
npx prisma generate

# Seed database
npm run prisma:seed

# Format schema file
npx prisma format
```

---

## ⚠️ Production Checklist

Before deploying to production:

- [ ] Change default credentials
- [ ] Enable SSL connections
- [ ] Configure automated backups
- [ ] Monitor database performance
- [ ] Set up query logging
- [ ] Configure roles/permissions
- [ ] Test disaster recovery
- [ ] Document custom scripts
- [ ] Plan capacity for growth

---

## 🔍 Normalization Verification

This database follows **3NF (Third Normal Form)**:

✅ **1NF**: All values atomic (no repeating groups)
✅ **2NF**: All non-key attributes depend on primary key
✅ **3NF**: No transitive dependencies between non-key attributes

**Result**: Minimal data redundancy, maximum data integrity

---

## 📞 Support & Troubleshooting

### Connection Failed
```bash
# Check if PostgreSQL is running
psql -U postgres -d postgres
```

### Port Already in Use
```bash
# Kill process using port 5432
lsof -ti:5432 | xargs kill
```

### Permissions Issues
```bash
# Reset user permissions
psql -U postgres
ALTER USER freelancer WITH PASSWORD 'newpassword';
GRANT ALL PRIVILEGES ON DATABASE freelanceflow TO freelancer;
```

### Views Not Showing
```bash
# Recreate views
psql freelanceflow < views.sql
```

---

## 🎯 Next Steps

1. **Review** [SCHEMA_DOCUMENTATION.md](SCHEMA_DOCUMENTATION.md) for detailed design
2. **Follow** [MIGRATION.md](MIGRATION.md) for step-by-step setup
3. **Explore** analytics views in `views.sql`
4. **Test** with provided seed data
5. **Customize** schema for your requirements

---

## 📄 File Manifest

```
database/
├── schema.sql                    # Complete PostgreSQL DDL
├── views.sql                     # 9 analytics views
├── seed.sql                      # Optional seed data
├── README.md                     # This file
├── MIGRATION.md                  # Migration guide
└── SCHEMA_DOCUMENTATION.md       # Complete reference

prisma/
├── schema.prisma                 # Prisma ORM schema
└── seed.js                       # TypeScript seed script
```

---

**Status**: ✅ Production-Ready  
**Last Updated**: March 30, 2026  
**Normalization**: 3NF  
**ACID Compliance**: ✅ Full  
**Audit Trail**: ✅ Complete  
**Analytics Views**: ✅ 9 views included

---

Ready to use! Follow [MIGRATION.md](MIGRATION.md) to get started.
