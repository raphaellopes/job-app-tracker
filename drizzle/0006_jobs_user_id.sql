-- Drop legacy job data (no user association); keep users table intact.
TRUNCATE TABLE "job_interview_prep" CASCADE;
--> statement-breakpoint
TRUNCATE TABLE "jobs" CASCADE;
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "user_id" integer NOT NULL;
--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;
