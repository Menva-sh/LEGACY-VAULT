-- Create executor_access_logs table for audit trail
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
