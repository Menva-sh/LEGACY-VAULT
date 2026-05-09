-- Add executor authentication fields
ALTER TABLE executors 
ADD COLUMN password VARCHAR(255),
ADD COLUMN setup_token VARCHAR(255) UNIQUE,
ADD COLUMN token_expires_at TIMESTAMP,
ADD COLUMN is_active BOOLEAN DEFAULT FALSE,
ADD COLUMN last_login TIMESTAMP;

-- Create index on setup_token for faster lookups
CREATE INDEX idx_executors_setup_token ON executors(setup_token);
CREATE INDEX idx_executors_is_active ON executors(is_active);
