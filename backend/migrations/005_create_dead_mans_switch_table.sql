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
