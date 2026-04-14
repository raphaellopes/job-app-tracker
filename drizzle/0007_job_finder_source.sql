ALTER TABLE "jobs" ADD COLUMN "external_source" text;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_job_id" text;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "external_apply_link" text;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "employer_logo" text;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "job_publisher" text;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "employment_types" text[] DEFAULT '{}'::text[] NOT NULL;
