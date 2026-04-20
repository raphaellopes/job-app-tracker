import { sql } from "drizzle-orm";
import { integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

import { jobs } from "./jobs";

export const jobInterviewPrep = pgTable(
  "job_interview_prep",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => jobs.id, { onDelete: "cascade" }),
    suggestedSkills: text("suggested_skills")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    mockQuestions: text("mock_questions")
      .array()
      .default(sql`'{}'::text[]`)
      .notNull(),
    resumeMatchScore: integer("resume_match_score").notNull(),
    tips: text("tips").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("job_interview_prep_job_id_unique").on(table.jobId)],
);

export type JobInterviewPrep = typeof jobInterviewPrep.$inferSelect;
export type NewJobInterviewPrep = typeof jobInterviewPrep.$inferInsert;
