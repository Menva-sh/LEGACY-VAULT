-- Create junction table for many-to-many will-executor assignments
CREATE TABLE IF NOT EXISTS will_executor_assignments (
  id SERIAL PRIMARY KEY,
  will_id INTEGER NOT NULL REFERENCES digital_wills(id) ON DELETE CASCADE,
  executor_id INTEGER NOT NULL REFERENCES executors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(will_id, executor_id)
);

CREATE INDEX IF NOT EXISTS idx_will_executor_assignments_will_id ON will_executor_assignments(will_id);
CREATE INDEX IF NOT EXISTS idx_will_executor_assignments_executor_id ON will_executor_assignments(executor_id);

-- Remove the old single executor_id column from digital_wills
ALTER TABLE digital_wills 
DROP COLUMN IF EXISTS executor_id;
