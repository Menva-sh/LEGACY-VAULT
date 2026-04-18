-- Add file_path column to digital_wills table
ALTER TABLE digital_wills 
ADD COLUMN IF NOT EXISTS file_path VARCHAR(500);

CREATE INDEX IF NOT EXISTS idx_digital_wills_file_path ON digital_wills(file_path);
