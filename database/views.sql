-- PostgreSQL Views for Advanced Analytics
-- File: prisma/views.sql
-- Purpose: Create materialized and regular views for reporting and analytics
-- Note: Run these after the main schema is created

-- ============================================================================
-- REVENUE SUMMARY VIEW
-- ============================================================================
-- Purpose: Calculate total revenue (paid invoices) per project
-- Used for: Executive dashboards, project profitability analysis
-- Performance: Projects with many payments will benefit from materialized view

CREATE OR REPLACE VIEW revenue_summary AS
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
    (COALESCE(SUM(pay.amount), 0) / NULLIF(p.budget, 0) * 100)::numeric, 
    2
  ) AS revenue_percentage,
  p.status AS project_status,
  p.priority AS project_priority
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN payments pay ON p.id = pay.project_id AND pay.status = 'PAID'
GROUP BY p.id, c.id, p.name, c.company, p.budget, p.status, p.priority;

-- ============================================================================
-- PROJECT FINANCIAL SUMMARY VIEW
-- ============================================================================
-- Purpose: Complete financial overview per project (paid + pending + overdue)
-- Use Case: Budget tracking, financial forecasting
-- Shows: Budgeted vs. invoiced amounts

CREATE OR REPLACE VIEW project_financial_summary AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  c.company AS client_company,
  p.budget AS budgeted_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) AS paid_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END), 0) AS pending_amount,
  COALESCE(SUM(CASE WHEN pay.status = 'OVERDUE' THEN pay.amount ELSE 0 END), 0) AS overdue_amount,
  COALESCE(SUM(pay.amount), 0) AS total_invoiced,
  p.budget - COALESCE(SUM(pay.amount), 0) AS remaining_budget,
  CASE 
    WHEN p.budget = 0 THEN 0
    ELSE ROUND(
      ((COALESCE(SUM(pay.amount), 0) / NULLIF(p.budget, 0)) * 100)::numeric, 
      2
    )
  END AS budget_utilization_percent,
  p.created_at AS project_start_date,
  p.end_date AS project_end_date,
  p.status AS project_status
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY p.id, c.id, p.name, p.budget, p.created_at, p.end_date, p.status;

-- ============================================================================
-- OVERDUE PAYMENTS VIEW
-- ============================================================================
-- Purpose: Track all overdue payments for collections
-- Use Case: Accounts receivable, collections management
-- Alert: Shows payments past due date

CREATE OR REPLACE VIEW overdue_payments AS
SELECT 
  pay.id AS payment_id,
  pay.invoice_number,
  p.id AS project_id,
  p.name AS project_name,
  c.company AS client_name,
  c.email AS client_email,
  u.email AS client_contact_email,
  pay.amount,
  pay.currency,
  pay.due_date,
  CURRENT_TIMESTAMP - pay.due_date AS days_overdue,
  (EXTRACT(DAY FROM CURRENT_TIMESTAMP - pay.due_date))::INTEGER AS days_overdue_int,
  pay.status,
  CASE 
    WHEN EXTRACT(DAY FROM CURRENT_TIMESTAMP - pay.due_date) > 90 THEN 'CRITICAL'
    WHEN EXTRACT(DAY FROM CURRENT_TIMESTAMP - pay.due_date) > 30 THEN 'HIGH'
    ELSE 'MEDIUM'
  END AS escalation_level
FROM payments pay
JOIN projects p ON pay.project_id = p.id
JOIN clients c ON p.client_id = c.id
JOIN users u ON c.user_id = u.id
WHERE pay.status = 'OVERDUE'
  AND pay.due_date < CURRENT_TIMESTAMP
ORDER BY pay.due_date ASC;

-- ============================================================================
-- UPCOMING PAYMENTS VIEW
-- ============================================================================
-- Purpose: Predict cash flow by showing upcoming due payments
-- Use Case: Cash flow forecasting, payment scheduling
-- Looks ahead: Shows payments due in next 30 days

CREATE OR REPLACE VIEW upcoming_payments AS
SELECT 
  pay.id AS payment_id,
  pay.invoice_number,
  p.id AS project_id,
  p.name AS project_name,
  c.company AS client_name,
  pay.amount,
  pay.currency,
  pay.due_date,
  CURRENT_TIMESTAMP - pay.due_date AS days_relative,
  (EXTRACT(DAY FROM pay.due_date - CURRENT_TIMESTAMP))::INTEGER AS days_until_due,
  pay.status,
  CASE 
    WHEN EXTRACT(DAY FROM pay.due_date - CURRENT_TIMESTAMP) < 0 THEN 'OVERDUE'
    WHEN EXTRACT(DAY FROM pay.due_date - CURRENT_TIMESTAMP) < 7 THEN 'THIS_WEEK'
    WHEN EXTRACT(DAY FROM pay.due_date - CURRENT_TIMESTAMP) < 14 THEN 'THIS_FORTNIGHT'
    ELSE 'UPCOMING'
  END AS payment_urgency
FROM payments pay
JOIN projects p ON pay.project_id = p.id
JOIN clients c ON p.client_id = c.id
WHERE pay.status IN ('PENDING', 'OVERDUE')
  AND pay.due_date <= CURRENT_TIMESTAMP + INTERVAL '30 days'
ORDER BY pay.due_date ASC;

-- ============================================================================
-- USER ACTIVITY SUMMARY VIEW
-- ============================================================================
-- Purpose: Summary of user activities for engagement tracking
-- Use Case: User analytics, activity monitoring
-- Shows: Action frequency, last activity time

CREATE OR REPLACE VIEW user_activity_summary AS
SELECT 
  u.id AS user_id,
  u.name,
  u.email,
  COUNT(al.id) AS total_actions,
  MAX(al.timestamp) AS last_activity,
  COUNT(DISTINCT DATE(al.timestamp)) AS active_days,
  COUNT(DISTINCT al.action) AS unique_actions,
  ROUND(
    COUNT(al.id)::NUMERIC / NULLIF(COUNT(DISTINCT DATE(al.timestamp)), 0),
    2
  ) AS avg_actions_per_day,
  u.created_at AS user_created_at,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - u.created_at)::INTEGER AS days_as_member
FROM users u
LEFT JOIN activity_logs al ON u.id = al.user_id
GROUP BY u.id, u.name, u.email, u.created_at
ORDER BY MAX(al.timestamp) DESC NULLS LAST;

-- ============================================================================
-- PROJECT PERFORMANCE VIEW
-- ============================================================================
-- Purpose: Multi-dimensional project performance metrics
-- Use Case: Project management dashboards, performance analytics
-- Shows: Budget adherence, task completion, timeline

CREATE OR REPLACE VIEW project_performance AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  c.company AS client_company,
  p.status AS project_status,
  p.priority,
  p.start_date,
  p.end_date,
  COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0) AS completed_tasks,
  COALESCE(COUNT(t.id), 0) AS total_tasks,
  ROUND(
    (COALESCE(SUM(CASE WHEN t.status = 'COMPLETED' THEN 1 ELSE 0 END), 0)::NUMERIC / 
     NULLIF(COUNT(t.id), 0) * 100), 
    2
  ) AS task_completion_percentage,
  COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) AS paid_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END), 0) AS pending_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'OVERDUE' THEN pay.amount ELSE 0 END), 0) AS overdue_revenue,
  p.budget,
  COALESCE(SUM(pay.amount), 0) AS invoiced_total,
  p.budget - COALESCE(SUM(pay.amount), 0) AS remaining_budget
FROM projects p
JOIN clients c ON p.client_id = c.id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY p.id, c.id, p.name, p.status, p.priority, p.start_date, p.end_date, p.budget
ORDER BY p.created_at DESC;

-- ============================================================================
-- CLIENT REVENUE VIEW
-- ============================================================================
-- Purpose: Total revenue and metrics per client
-- Use Case: Client profitability, account management
-- Shows: Client lifetime value, project count, payment status

CREATE OR REPLACE VIEW client_revenue AS
SELECT 
  c.id AS client_id,
  c.company AS client_company,
  c.name AS contact_name,
  c.email,
  COUNT(DISTINCT p.id) AS total_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'ONGOING' THEN p.id END) AS ongoing_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'COMPLETED' THEN p.id END) AS completed_projects,
  COALESCE(SUM(p.budget), 0) AS total_project_budget,
  COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) AS total_paid_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END), 0) AS total_pending_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'OVERDUE' THEN pay.amount ELSE 0 END), 0) AS total_overdue_revenue,
  COALESCE(SUM(pay.amount), 0) AS total_invoiced,
  MAX(p.created_at) AS most_recent_project_date,
  c.created_at AS client_created_at,
  EXTRACT(DAY FROM CURRENT_TIMESTAMP - c.created_at)::INTEGER AS days_as_client
FROM clients c
LEFT JOIN projects p ON c.id = p.client_id
LEFT JOIN payments pay ON p.id = pay.project_id
GROUP BY c.id, c.company, c.name, c.email, c.created_at
ORDER BY COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) DESC;

-- ============================================================================
-- TASK STATUS DISTRIBUTION VIEW
-- ============================================================================
-- Purpose: Overview of task status across all projects
-- Use Case: Project health monitoring, operational dashboards
-- Shows: Queue of pending tasks, completion rates

CREATE OR REPLACE VIEW task_status_distribution AS
SELECT 
  p.id AS project_id,
  p.name AS project_name,
  COUNT(DISTINCT CASE WHEN t.status = 'PENDING' THEN t.id END) AS pending_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'IN_PROGRESS' THEN t.id END) AS in_progress_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'CANCELLED' THEN t.id END) AS cancelled_tasks,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.deadline < CURRENT_TIMESTAMP AND t.status != 'COMPLETED' THEN t.id END) AS overdue_tasks,
  ROUND(
    (COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.id END)::NUMERIC / 
     NULLIF(COUNT(DISTINCT t.id), 0) * 100), 
    2
  ) AS completion_percentage
FROM projects p
LEFT JOIN tasks t ON p.id = t.project_id
GROUP BY p.id, p.name
ORDER BY overdue_tasks DESC, total_tasks DESC;

-- ============================================================================
-- DASHBOARD SUMMARY VIEW
-- ============================================================================
-- Purpose: High-level executive dashboard metrics
-- Use Case: Executive summary, KPI monitoring
-- Shows: System-wide health indicators

CREATE OR REPLACE VIEW dashboard_summary AS
SELECT 
  COUNT(DISTINCT u.id) AS total_users,
  COUNT(DISTINCT c.id) AS total_clients,
  COUNT(DISTINCT p.id) AS total_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'ONGOING' THEN p.id END) AS active_projects,
  COUNT(DISTINCT CASE WHEN p.status = 'COMPLETED' THEN p.id END) AS completed_projects,
  COUNT(DISTINCT t.id) AS total_tasks,
  COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.id END) AS completed_tasks,
  COUNT(DISTINCT pay.id) AS total_payments,
  COUNT(DISTINCT CASE WHEN pay.status = 'PAID' THEN pay.id END) AS paid_payments,
  COUNT(DISTINCT CASE WHEN pay.status = 'PENDING' THEN pay.id END) AS pending_payments,
  COUNT(DISTINCT CASE WHEN pay.status = 'OVERDUE' THEN pay.id END) AS overdue_payments,
  COALESCE(SUM(CASE WHEN pay.status = 'PAID' THEN pay.amount ELSE 0 END), 0) AS total_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'PENDING' THEN pay.amount ELSE 0 END), 0) AS pending_revenue,
  COALESCE(SUM(CASE WHEN pay.status = 'OVERDUE' THEN pay.amount ELSE 0 END), 0) AS overdue_revenue,
  COALESCE(SUM(p.budget), 0) AS total_project_budget
FROM users u
LEFT JOIN clients c ON u.id = c.user_id
LEFT JOIN projects p ON c.id = p.client_id
LEFT JOIN tasks t ON p.id = t.project_id
LEFT JOIN payments pay ON p.id = pay.project_id;

-- ============================================================================
-- GRANT PERMISSIONS (for read-only analytics users)
-- ============================================================================

-- Grant view access to analytics role (if exists)
-- GRANT SELECT ON revenue_summary TO analytics_user;
-- GRANT SELECT ON project_financial_summary TO analytics_user;
-- GRANT SELECT ON overdue_payments TO analytics_user;
-- GRANT SELECT ON upcoming_payments TO analytics_user;
-- GRANT SELECT ON user_activity_summary TO analytics_user;
-- GRANT SELECT ON project_performance TO analytics_user;
-- GRANT SELECT ON client_revenue TO analytics_user;
-- GRANT SELECT ON task_status_distribution TO analytics_user;
-- GRANT SELECT ON dashboard_summary TO analytics_user;

-- ============================================================================
-- VIEW SUMMARY
-- ============================================================================
-- Total Views: 9
-- 
-- Financial Views:
--   1. revenue_summary - Paid revenue per project
--   2. project_financial_summary - Complete project financials
--   3. client_revenue - Revenue metrics per client
--
-- Operational Views:
--   4. task_status_distribution - Task queue and completion rates
--   5. project_performance - Multi-dimensional project metrics
--
-- Monitoring Views:
--   6. overdue_payments - Collections monitoring
--   7. upcoming_payments - Cash flow forecasting
--   8. user_activity_summary - User engagement tracking
--
-- Executive Views:
--   9. dashboard_summary - System-wide KPI snapshot
--
-- Performance Notes:
--   - Views use LEFT JOIN to include projects with no payments/tasks
--   - NULLIF prevents division by zero errors
--   - Consider materialized views for large datasets
--   - Index supporting columns for optimal performance
-- ============================================================================
