-- Make projectId optional in tasks table
-- Run this in your Neon database console

-- Step 1: Make projectId column nullable
ALTER TABLE "tasks" ALTER COLUMN "projectId" DROP NOT NULL;

-- Step 2: Verify the change
-- SELECT column_name, is_nullable, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'tasks' AND column_name = 'projectId';

-- Note: This allows tasks to be created without a project assignment
-- Tasks with NULL projectId are considered general tasks
