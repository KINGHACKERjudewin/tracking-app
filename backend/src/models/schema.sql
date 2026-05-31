-- Run this in your Supabase SQL editor or local PostgreSQL

-- Users
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(255)  NOT NULL UNIQUE,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Tasks / Productivity
CREATE TABLE IF NOT EXISTS tasks (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title            VARCHAR(255)  NOT NULL,
  category         VARCHAR(50)   NOT NULL DEFAULT 'Work',
  priority         VARCHAR(20)   NOT NULL DEFAULT 'Medium' CHECK (priority IN ('High','Medium','Low')),
  status           VARCHAR(20)   NOT NULL DEFAULT 'Todo'   CHECK (status IN ('Todo','In Progress','Done','Overdue')),
  due_date         DATE,
  estimated_hours  NUMERIC(4,1)  DEFAULT 0,
  estimated_minutes INT          DEFAULT 0,
  notes            TEXT,
  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Budget / Finance
CREATE TABLE IF NOT EXISTS budget_entries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  description VARCHAR(255)  NOT NULL,
  amount      NUMERIC(12,2) NOT NULL,
  type        VARCHAR(10)   NOT NULL CHECK (type IN ('Income','Expense')),
  category    VARCHAR(50)   NOT NULL,
  entry_date  DATE          NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Time Tracking Sessions
CREATE TABLE IF NOT EXISTS time_sessions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  task_name   VARCHAR(255)  NOT NULL,
  task_id     UUID          REFERENCES tasks(id) ON DELETE SET NULL,
  started_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  ended_at    TIMESTAMPTZ,
  duration_seconds INT,
  notes       TEXT,
  created_at  TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user        ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status      ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_budget_user       ON budget_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_date       ON budget_entries(entry_date);
CREATE INDEX IF NOT EXISTS idx_time_user         ON time_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_time_started      ON time_sessions(started_at);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
