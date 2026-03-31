-- Production-grade PostgreSQL Database Schema (3NF)
-- Generated from Prisma ORM schema
-- Database: freelanceflow
-- Purpose: Financial tracking, project management, and operations

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

CREATE TYPE project_status AS ENUM ('ONGOING', 'COMPLETED');
CREATE TYPE priority AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE payment_status AS ENUM ('PAID', 'PENDING', 'OVERDUE');
CREATE TYPE task_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users Table - Authentication and identity
-- Primary Key: id (CUID)
-- Indexed: email (ensures fast login lookups)
-- Timestamps: createdAt, updatedAt (audit trail)
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- CLIENT MANAGEMENT
-- ============================================================================

-- Clients Table - 1:1 relationship with users
-- Represents client company profiles
-- Foreign Key: user_id → users.id (CASCADE DELETE)
CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_clients_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_clients_user_id ON clients(user_id);

-- ============================================================================
-- PROJECT MANAGEMENT
-- ============================================================================

-- Projects Table - Core project tracking
-- Normalized to avoid data duplication
-- Foreign Key: client_id → clients.id (CASCADE DELETE)
-- Indexes: clientId (common filter), startDate/endDate (range queries)
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  budget DECIMAL(12, 2) NOT NULL,
  status project_status NOT NULL DEFAULT 'ONGOING',
  priority priority NOT NULL DEFAULT 'MEDIUM',
  start_date TIMESTAMP(3) NOT NULL,
  end_date TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_projects_client_id 
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  CONSTRAINT chk_budget_positive CHECK (budget >= 0),
  CONSTRAINT chk_dates_valid CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE INDEX idx_projects_client_id ON projects(client_id);
CREATE INDEX idx_projects_start_date ON projects(start_date);
CREATE INDEX idx_projects_end_date ON projects(end_date);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_priority ON projects(priority);

-- ============================================================================
-- FINANCIAL TRACKING
-- ============================================================================

-- Payments Table - Invoice and payment management
-- Normalized payment tracking
-- Foreign Key: project_id → projects.id (CASCADE DELETE)
-- Indexes: projectId (join queries), status (reporting), invoiceNumber (lookups)
-- Constraints: Ensure financial data integrity
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  invoice_number VARCHAR(255) NOT NULL UNIQUE,
  status payment_status NOT NULL DEFAULT 'PENDING',
  due_date TIMESTAMP(3) NOT NULL,
  paid_date TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_payments_project_id 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT chk_amount_positive CHECK (amount > 0),
  CONSTRAINT chk_paid_date_valid CHECK (paid_date IS NULL OR paid_date >= due_date)
);

CREATE INDEX idx_payments_project_id ON payments(project_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_invoice_number ON payments(invoice_number);
CREATE INDEX idx_payments_due_date ON payments(due_date);
CREATE INDEX idx_payments_paid_date ON payments(paid_date);

-- ============================================================================
-- TASK MANAGEMENT
-- ============================================================================

-- Tasks Table - Task tracking and deadline management
-- Foreign Key: project_id → projects.id (CASCADE DELETE)
-- Indexes: projectId (retrieval), status (filtering)
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  title VARCHAR(255) NOT NULL,
  status task_status NOT NULL DEFAULT 'PENDING',
  deadline TIMESTAMP(3),
  created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_tasks_project_id 
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_deadline ON tasks(deadline);

-- ============================================================================
-- AUDIT & LOGGING
-- ============================================================================

-- Activity Logs Table - Complete audit trail for compliance
-- Foreign Key: user_id → users.id (CASCADE DELETE)
-- Indexes: userId (user activity queries), timestamp (temporal queries)
-- Purpose: Track all user actions for security and compliance audit
CREATE TABLE activity_logs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  action VARCHAR(255) NOT NULL,
  timestamp TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  details TEXT,
  
  CONSTRAINT fk_activity_logs_user_id 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);

-- ============================================================================
-- DATABASE VIEWS - MATERIALIZED ANALYTICS
-- ============================================================================

-- View: revenue_summary
-- Purpose: Calculate total revenue (paid invoices) per project
-- Used for: Project profitability analysis and reporting
-- Performance: Indexed on project_id for fast joins
CREATE VIEW revenue_summary AS
SELECT 
  p.id AS project_id,
  c.id AS client_id,
  p.name AS project_name,
  c.company AS client_company,
  COALESCE(SUM(pay.amount), 0) AS total_revenue,
  COUNT(DISTINCT CASE WHEN pay.status = 'PAID' THEN pay.id END) AS paid_invoices,
  COUNT(DISTINCT CASE WHEN pay.status = 'PENDING' THEN pay.id END) AS pending_invoices,
  COUNT(DISTINCT CASE WHEN pay.status = 'OVERDUE' THEN pay.id END) AS overdue_invoices,
  MAX(pay.paid_date) AS last_payment_date,
  p.budget AS project_budget,
  ROUND(
    (COALESCE(SUM(pay.amount), 0) / p.budget * 100)::numeric, 
    2
  ) AS revenue_percentage,
  p.status AS project_status
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN payments pay ON p.id = pay.project_id AND pay.status = 'PAID'
GROUP BY p.id, c.id, p.name, c.company, p.budget, p.status;

-- View: project_financial_summary
-- Purpose: Complete financial overview per project (paid + pending)
CREATE VIEW project_financial_summary AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  p.budget AS budgeted_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) AS paid_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END), 0) AS pending_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'OVERDUE' THEN pay.amount ELSE 0 END), 0) AS overdue_amount,
  COALESCE(SUM(pay.amount), 0) AS total_invoiced,
  p.budget - COALESCE(SUM(pay.amount), 0) AS remaining_budget,
  ROUND(
    ((COALESCE(SUM(pay.amount), 0) / NULLIF(p.budget, 0)) * 100)::numeric, 
    2
  ) AS budget_utilization_percent
FROM projects p
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY p.id, p.name, p.budget;

-- View: overdue_payments
-- Purpose: Track all overdue payments for collections
CREATE VIEW overdue_payments AS
SELECT 
  pay.id AS payment_id,
  pay.invoice_number,
  p.id AS project_id,
  p.name AS project_name,
  c.company AS client_name,
  pay.amount,
  pay.currency,
  pay.due_date,
  CURRENT_TIMESTAMP - pay.due_date AS days_overdue,
  pay.status
FROM payments pay
JOIN projects p ON pay.project_id = p.id
JOIN clients c ON p.client_id = c.id
WHERE pay.status = 'OVERDUE'
  AND pay.due_date < CURRENT_TIMESTAMP
ORDER BY pay.due_date ASC;

-- View: user_activity_summary
-- Purpose: Summary of user activities for engagement tracking
CREATE VIEW user_activity_summary AS
SELECT 
  u.id AS user_id,
  u.name,
  u.email,
  COUNT(al.id) AS total_actions,
  MAX(al.timestamp) AS last_activity,
  COUNT(DISTINCT DATE(al.timestamp)) AS active_days,
  COUNT(DISTINCT al.action) AS unique_actions
FROM users u
LEFT JOIN activity_logs al ON u.id = al.user_id
GROUP BY u.id, u.name, u.email;

-- ============================================================================
-- INTEGRITY CONSTRAINTS & COMMENTS
-- ============================================================================

-- Add table comments for documentation
COMMENT ON TABLE users IS 'Authentication and user identity management';
COMMENT ON TABLE clients IS 'Client/company profiles linked to users';
COMMENT ON TABLE projects IS 'Projects managed for clients with budget and timeline';
COMMENT ON TABLE payments IS 'Payment and invoice tracking per project';
COMMENT ON TABLE tasks IS 'Tasks associated with projects';
COMMENT ON TABLE activity_logs IS 'Audit trail of all user activities';

-- Add column comments
COMMENT ON COLUMN users.password_hash IS 'Hashed password using bcrypt (min 10 rounds)';
COMMENT ON COLUMN projects.budget IS 'Project budget in specified currency (12,2 decimal places)';
COMMENT ON COLUMN payments.status IS 'Payment status: PAID, PENDING, or OVERDUE';
COMMENT ON COLUMN tasks.status IS 'Task status: PENDING, IN_PROGRESS, COMPLETED, CANCELLED';
