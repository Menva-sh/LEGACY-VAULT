-- LEGACY VAULT - Database Initialization Script
-- Run this in PostgreSQL before testing

-- Drop existing tables (optional - for fresh start)
-- DROP TABLE IF EXISTS executor_access_logs CASCADE;
-- DROP TABLE IF EXISTS dead_mans_switch CASCADE;
-- DROP TABLE IF EXISTS digital_wills CASCADE;
-- DROP TABLE IF EXISTS executors CASCADE;
-- DROP TABLE IF EXISTS digital_assets CASCADE;
-- DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
PRINT 'Users table created ✓';

-- Create digital_assets table
CREATE TABLE IF NOT EXISTS digital_assets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  asset_name VARCHAR(255) NOT NULL,
  asset_type VARCHAR(50) NOT NULL,
  description TEXT,
  file_path VARCHAR(500),
  file_size INTEGER,
  is_encrypted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_digital_assets_user_id ON digital_assets(user_id);
PRINT 'Digital Assets table created ✓';

-- Create executors table
CREATE TABLE IF NOT EXISTS executors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  executor_email VARCHAR(255) NOT NULL,
  executor_name VARCHAR(255),
  permissions VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, executor_email)
);
CREATE INDEX IF NOT EXISTS idx_executors_user_id ON executors(user_id);
CREATE INDEX IF NOT EXISTS idx_executors_email ON executors(executor_email);
PRINT 'Executors table created ✓';

-- Create digital_wills table
CREATE TABLE IF NOT EXISTS digital_wills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  executor_id INTEGER REFERENCES executors(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  effective_date TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_digital_wills_user_id ON digital_wills(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_wills_status ON digital_wills(status);
PRINT 'Digital Wills table created ✓';

-- Create dead_mans_switch table
CREATE TABLE IF NOT EXISTS dead_mans_switch (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_value INTEGER,
  action_type VARCHAR(50),
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  last_check TIMESTAMP,
  triggered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_dead_mans_switch_user_id ON dead_mans_switch(user_id);
CREATE INDEX IF NOT EXISTS idx_dead_mans_switch_active ON dead_mans_switch(is_active);
PRINT 'Dead Mans Switch table created ✓';

-- Create executor_access_logs table
CREATE TABLE IF NOT EXISTS executor_access_logs (
  id SERIAL PRIMARY KEY,
  executor_id INTEGER NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  access_type VARCHAR(100),
  accessed_resource VARCHAR(255),
  accessed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_executor_access_logs_executor_id ON executor_access_logs(executor_id);
CREATE INDEX IF NOT EXISTS idx_executor_access_logs_user_id ON executor_access_logs(user_id);
PRINT 'Executor Access Logs table created ✓';

-- Verify tables are created
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

PRINT 'Database initialization complete! ✓';
PRINT '';
PRINT 'Tables created:';
PRINT '- users';
PRINT '- digital_assets';
PRINT '- executors';
PRINT '- digital_wills';
PRINT '- dead_mans_switch';
PRINT '- executor_access_logs';
