-- Add email and password columns to digital_assets table
ALTER TABLE digital_assets 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS password TEXT;

-- Update the table to allow these fields for existing records
UPDATE digital_assets SET email = '' WHERE email IS NULL;
UPDATE digital_assets SET password = '' WHERE password IS NULL;

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_digital_assets_email ON digital_assets(email);
