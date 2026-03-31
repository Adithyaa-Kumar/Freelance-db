# Database Migration Guide

## Overview

This guide covers migrating from the previous freelance project (FreelanceFlow v1) to the production-grade 3NF database schema.

---

## Migration Steps

### Step 1: Backup Current Database

```bash
# Create backup before migration
pg_dump freelanceflow > backup_freelanceflow_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Create New Migration

```bash
cd backend

# Generate new migration
npx prisma migrate dev --name init_production_schema
```

This command will:
1. Create a migration file: `prisma/migrations/<timestamp>_init_production_schema/migration.sql`
2. Apply the migration to your database
3. Generate the Prisma Client

### Step 3: Apply Enums

Prisma will automatically create the ENUM types when running the migration:
- `project_status` (ONGOING, COMPLETED)
- `priority` (LOW, MEDIUM, HIGH)
- `payment_status` (PAID, PENDING, OVERDUE)
- `task_status` (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)

### Step 4: Create Views Manually

If using Prisma, views are not automatically created. Execute these separately:

```bash
psql freelanceflow < prisma/views.sql
```

Or copy the SQL from [views.sql](./views.sql) and execute in psql/pgAdmin.

### Step 5: Seed Sample Data (Optional)

```bash
npm run prisma:seed
```

Updates the seed file to use the new schema.

---

## Migration SQL (Raw PostgreSQL)

If you prefer to migrate manually without Prisma:

```bash
# Connect to PostgreSQL
psql -U postgres -d freelanceflow

# Execute the schema
\i database/schema.sql

# Verify tables created
\dt

# Verify views created
\dv

# Verify enums
\dT+
```

---

## Data Migration (if migrating from old schema)

### For existing user data:

```sql
-- Step 1: Migrate users (if data exists)
INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
SELECT 
  id, 
  name, 
  email, 
  password, 
  COALESCE(created_at, NOW()), 
  COALESCE(updated_at, NOW())
FROM old_users;
```

### For existing projects:

```sql
-- Step 2: Create clients for existing users
INSERT INTO clients (id, user_id, name, email, company, created_at, updated_at)
SELECT 
  gen_random_uuid()::text,
  u.id,
  u.name,
  u.email,
  'Company Name',  -- Replace with actual company info
  NOW(),
  NOW()
FROM users u
WHERE NOT EXISTS (SELECT 1 FROM clients WHERE user_id = u.id)
LIMIT 1;  -- One client per user
```

### For existing projects:

```sql
-- Step 3: Migrate projects
INSERT INTO projects (
  id, client_id, name, description, budget, status, 
  priority, start_date, end_date, created_at, updated_at
)
SELECT 
  id,
  c.id,  -- Get first client_id
  title,
  description,
  budget::DECIMAL(12,2),
  CASE WHEN status = 'completed' THEN 'COMPLETED' ELSE 'ONGOING' END,
  CASE priority 
    WHEN 'high' THEN 'HIGH'
    WHEN 'low' THEN 'LOW'
    ELSE 'MEDIUM'
  END,
  deadline,  -- Use as start_date
  deadline,  -- Use as end_date
  COALESCE(created_at, NOW()),
  COALESCE(updated_at, NOW())
FROM old_projects op
CROSS JOIN (SELECT id FROM clients LIMIT 1) c;
```

---

## Post-Migration Verification

### 1. Check Table Counts

```sql
SELECT 
  'users' as table_name, COUNT(*) as row_count FROM users
UNION ALL
SELECT 'clients', COUNT(*) FROM clients
UNION ALL
SELECT 'projects', COUNT(*) FROM projects
UNION ALL
SELECT 'payments', COUNT(*) FROM payments
UNION ALL
SELECT 'tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM activity_logs;
```

### 2. Verify Foreign Keys

```sql
-- List all foreign key constraints
SELECT constraint_name, table_name, column_name 
FROM information_schema.key_column_usage 
WHERE table_schema = 'public' 
AND constraint_name LIKE 'fk_%'
ORDER BY table_name;
```

### 3. Test Views

```sql
-- Test revenue_summary view
SELECT * FROM revenue_summary LIMIT 5;

-- Test project_financial_summary view
SELECT * FROM project_financial_summary LIMIT 5;

-- Test overdue_payments view
SELECT * FROM overdue_payments LIMIT 5;

-- Test user_activity_summary view
SELECT * FROM user_activity_summary LIMIT 5;
```

### 4. Check Indexes

```sql
-- List all indexes
SELECT indexname FROM pg_indexes WHERE schemaname = 'public' ORDER BY tablename;
```

---

## Rollback Procedure

If something goes wrong:

```bash
# Reset to previous migration (careful!)
npx prisma migrate resolve --rolled-back <migration_name>

# Or restore from backup
psql freelanceflow < backup_freelanceflow_YYYYMMDD_HHMMSS.sql
```

---

## Prisma Schema Sync

After migration, keep your schema in sync:

```bash
# Create a new migration after schema changes
npx prisma migrate dev --name <description>

# Push schema changes directly to database (dev only)
npx prisma db push

# Generate Prisma Client (after any schema changes)
npx prisma generate

# Visualize schema
npx prisma studio
```

---

## Performance Optimization (Post-Migration)

### 1. Analyze Tables for Query Planning

```sql
ANALYZE users;
ANALYZE clients;
ANALYZE projects;
ANALYZE payments;
ANALYZE tasks;
ANALYZE activity_logs;
```

### 2. Reindex if Necessary

```sql
REINDEX TABLE users;
REINDEX TABLE clients;
REINDEX TABLE projects;
REINDEX TABLE payments;
REINDEX TABLE tasks;
REINDEX TABLE activity_logs;
```

### 3. Update Table Statistics

```sql
VACUUM ANALYZE;
```

---

## Migration Timeline

| Step | Command | Time | Purpose |
|------|---------|------|---------|
| 1 | Backup | < 1min | Safety checkpoint |
| 2 | `prisma migrate dev` | 2-5min | Apply schema |
| 3 | Manual views | < 1min | Create analytics views |
| 4 | Data migration | Varies | Transfer old data (if needed) |
| 5 | Verification | < 1min | Ensure integrity |
| 6 | Performance tune | 2-3min | Optimize indexes |

---

## Troubleshooting

### Error: Foreign Key Constraint Violation

**Cause**: Child records exist without parent
**Solution**: 
```sql
-- Find orphaned records
SELECT * FROM projects WHERE client_id NOT IN (SELECT id FROM clients);

-- Delete orphaned records
DELETE FROM projects WHERE client_id NOT IN (SELECT id FROM clients);
```

### Error: Enum Type Already Exists

**Cause**: Running migration twice
**Solution**: 
```bash
npx prisma migrate deploy  # Apply only pending migrations
```

### Error: Cannot Drop Column (in reverse migration)

**Solution**: Create new migration to handle data:
```bash
npx prisma migrate dev --name fix_column_issue
```

---

## Best Practices

✅ **Always backup before migration:**
```bash
pg_dump freelanceflow > backup.sql
```

✅ **Test in development first:**
```bash
# Create test database
createdb freelanceflow_test

# Run migrations there
DATABASE_URL="postgresql://user:pass@localhost/freelanceflow_test" npx prisma migrate deploy
```

✅ **Use version control:**
```bash
# Migrations are auto-versioned by Prisma
git add prisma/migrations
git commit -m "chore: add production schema migration"
```

✅ **Document data transforms:**
```bash
# Create migration notes
echo "Migrated $(date)" >> MIGRATION_LOG.md
```

❌ **Avoid**: Skipping backups
❌ **Avoid**: Manual schema changes outside of Prisma
❌ **Avoid**: Running migrations on production without testing

---

## Production Deployment Checklist

- [ ] Database backed up
- [ ] Migrations tested in staging
- [ ] Schema verified for compliance
- [ ] Indexes confirmed for performance
- [ ] Views created successfully
- [ ] Sample data verified
- [ ] Monitoring enabled
- [ ] Rollback plan ready

---

## Additional Resources

- [Prisma Migrations Docs](https://www.prisma.io/docs/orm/prisma-migrate/overview)
- [PostgreSQL Backup Guide](https://www.postgresql.org/docs/current/backup.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)
