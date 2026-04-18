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
