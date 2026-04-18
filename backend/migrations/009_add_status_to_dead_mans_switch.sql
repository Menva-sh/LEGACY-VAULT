-- Add status column to dead_mans_switch for tracking switch state
ALTER TABLE dead_mans_switch ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending';

-- Status values: 'pending' (waiting), 'triggered' (user inactive), 'resolved' (user active again), 'cancelled'
CREATE INDEX IF NOT EXISTS idx_dead_mans_switch_status ON dead_mans_switch(status);
