-- Add last_active timestamp to users table for tracking user activity
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for efficient queries on last_active
CREATE INDEX IF NOT EXISTS idx_users_last_active ON users(last_active);
