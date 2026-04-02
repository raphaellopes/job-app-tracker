CREATE TABLE "job_interview_prep" (
	"id" serial PRIMARY KEY NOT NULL,
	"job_id" integer NOT NULL,
	"suggested_skills" text[] DEFAULT '{}'::text[] NOT NULL,
	"mock_questions" text[] DEFAULT '{}'::text[] NOT NULL,
	"resume_match_score" integer NOT NULL,
	"tips" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "job_interview_prep" ADD CONSTRAINT "job_interview_prep_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "job_interview_prep_job_id_unique" ON "job_interview_prep" USING btree ("job_id");
