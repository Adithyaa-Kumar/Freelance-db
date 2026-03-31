-- FreelanceFlow D1 Database Schema
-- Cloudflare D1 SQL Database Schema for Production Deployment

-- Users Table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  status TEXT DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Clients Table
CREATE TABLE IF NOT EXISTS "Client" (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  userId TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  website TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zipCode TEXT,
  country TEXT,
  notes TEXT,
  status TEXT DEFAULT 'active',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES "User"(id) ON DELETE CASCADE
);

-- Projects Table
CREATE TABLE IF NOT EXISTS "Project" (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  clientId TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'active',
  budget REAL,
  deadline DATETIME,
  startDate DATETIME,
  completedDate DATETIME,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (clientId) REFERENCES "Client"(id) ON DELETE CASCADE
);

-- Payments Table
CREATE TABLE IF NOT EXISTS "Payment" (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  projectId TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'pending',
  dueDate DATETIME,
  paidDate DATETIME,
  notes TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES "Project"(id) ON DELETE CASCADE
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS "Task" (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  projectId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  dueDate DATETIME,
  completedDate DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES "Project"(id) ON DELETE CASCADE
);

-- Create Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_client_userId ON "Client"(userId);
CREATE INDEX IF NOT EXISTS idx_project_clientId ON "Project"(clientId);
CREATE INDEX IF NOT EXISTS idx_payment_projectId ON "Payment"(projectId);
CREATE INDEX IF NOT EXISTS idx_task_projectId ON "Task"(projectId);
CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"(status);
CREATE INDEX IF NOT EXISTS idx_project_status ON "Project"(status);
CREATE INDEX IF NOT EXISTS idx_task_status ON "Task"(status);

-- Create View for Dashboard Analytics
CREATE VIEW IF NOT EXISTS project_revenue AS
SELECT 
  p.id as projectId,
  c.id as clientId,
  p.name as projectName,
  c.name as clientName,
  SUM(CASE WHEN pay.status = 'paid' THEN pay.amount ELSE 0 END) as revenue,
  SUM(CASE WHEN pay.status = 'pending' THEN pay.amount ELSE 0 END) as pending,
  COUNT(CASE WHEN pay.status != 'paid' AND pay.dueDate < CURRENT_TIMESTAMP THEN 1 END) as overdue_count
FROM "Project" p
LEFT JOIN "Client" c ON p.clientId = c.id
LEFT JOIN "Payment" pay ON p.id = pay.projectId
GROUP BY p.id, c.id;
