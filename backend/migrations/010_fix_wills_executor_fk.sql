-- Fix digital_wills executor_id foreign key to allow deletion
-- This migration changes the constraint from RESTRICT to SET NULL

-- Drop the old constraint and recreate it with ON DELETE SET NULL
ALTER TABLE digital_wills 
DROP CONSTRAINT digital_wills_executor_id_fkey;

ALTER TABLE digital_wills 
ADD CONSTRAINT digital_wills_executor_id_fkey 
FOREIGN KEY (executor_id) REFERENCES executors(id) ON DELETE SET NULL;

-- Verify the constraint was added
-- SELECT constraint_name FROM information_schema.table_constraints 
-- WHERE table_name = 'digital_wills' AND constraint_type = 'FOREIGN KEY';
