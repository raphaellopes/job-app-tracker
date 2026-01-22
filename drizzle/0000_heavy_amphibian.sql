-- Migration to add position column for job sorting
-- IMPORTANT: If you're using drizzle-kit push and getting column type errors,
-- you may need to manually rename the column first:
-- ALTER TABLE "jobs" RENAME COLUMN "position" TO "job_title";

-- Create the job_status enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE "public"."job_status" AS ENUM('WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED');
    END IF;
END $$;

-- Step 1: Rename existing text 'position' column to 'job_title' if it exists
DO $$ 
BEGIN
    -- If position (text) exists and job_title doesn't exist, rename it
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
    END IF;
    
    -- If job_title column doesn't exist at all, add it (for fresh databases)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'job_title'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "job_title" text;
        -- Update existing rows if any (though this shouldn't happen for fresh DBs)
        UPDATE "jobs" SET "job_title" = '' WHERE "job_title" IS NULL;
        ALTER TABLE "jobs" ALTER COLUMN "job_title" SET NOT NULL;
    END IF;
END $$;

-- Step 2: Add the integer 'position' column (only if it doesn't exist)
DO $$
BEGIN
    -- Only add if position column doesn't exist at all (as any type)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'jobs' 
        AND column_name = 'position'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE "jobs" ADD COLUMN "position" integer DEFAULT 0 NOT NULL;
    END IF;
END $$;

-- Step 3: Set initial positions based on creation order within each status
-- This ensures existing jobs have proper sort order (only if position is 0 for all)
DO $$
DECLARE
    status_val text;
    job_record RECORD;
    pos_counter integer;
    needs_update boolean;
BEGIN
    -- Check if we need to update positions (if all positions are 0)
    SELECT NOT EXISTS (
        SELECT 1 FROM "jobs" WHERE position != 0
    ) INTO needs_update;
    
    -- Only update if all positions are 0 (meaning they haven't been set yet)
    IF needs_update AND EXISTS (SELECT 1 FROM "jobs" LIMIT 1) THEN
        -- Loop through each status
        FOR status_val IN SELECT DISTINCT status::text FROM "jobs" LOOP
            pos_counter := 0;
            
            -- Update positions for jobs in this status, ordered by creation date
            FOR job_record IN 
                SELECT id 
                FROM "jobs" 
                WHERE status = status_val::job_status
                ORDER BY created_at ASC
            LOOP
                UPDATE "jobs" 
                SET position = pos_counter 
                WHERE id = job_record.id;
                
                pos_counter := pos_counter + 1;
            END LOOP;
        END LOOP;
    END IF;
END $$;
