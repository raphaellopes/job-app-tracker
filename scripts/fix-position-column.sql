-- Run this SQL script FIRST to rename the existing position column
-- This fixes the conflict before running the migration

-- Rename the text 'position' column to 'job_title' if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'position' 
        AND data_type = 'text'
        AND table_schema = 'public'
    ) AND NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'job_title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "jobs" RENAME COLUMN "position" TO "job_title";
        RAISE NOTICE 'Renamed position column to job_title';
    ELSE
        RAISE NOTICE 'Column rename not needed or already done';
    END IF;
END $$;
