-- Create digital_wills table
CREATE TABLE IF NOT EXISTS digital_wills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  content TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  executor_id INTEGER REFERENCES executors(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  effective_date TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_digital_wills_user_id ON digital_wills(user_id);
CREATE INDEX IF NOT EXISTS idx_digital_wills_status ON digital_wills(status);
