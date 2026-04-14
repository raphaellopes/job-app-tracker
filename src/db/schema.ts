import { sql } from "drizzle-orm";
import {
  date,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const jobStatusEnum = pgEnum("job_status", [
  "WISHLIST",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
]);

export const JOB_STATUSES = jobStatusEnum.enumValues;
export type JobStatusType = (typeof JOB_STATUSES)[number];

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    firebaseUid: text("firebase_uid").notNull(),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    uniqueIndex("users_firebase_uid_unique").on(table.firebaseUid),
    uniqueIndex("users_email_unique").on(table.email),
  ],
);

export const jobs = pgTable("jobs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  companyName: text("company_name").notNull(),
  jobTitle: text("job_title").notNull(),
  tags: text("tags")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  status: jobStatusEnum("status").default("WISHLIST").notNull(),
  position: integer("position").default(0).notNull(),
  salaryRange: text("salary_range"),
  appliedDate: date("applied_date"),
  description: text("description"),
  notes: text("notes"),
  externalSource: text("external_source"),
  externalJobId: text("external_job_id"),
  externalApplyLink: text("external_apply_link"),
  employerLogo: text("employer_logo"),
  jobPublisher: text("job_publisher"),
  employmentTypes: text("employment_types")
    .array()
    .default(sql`'{}'::text[]`)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

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

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
export type JobInterviewPrep = typeof jobInterviewPrep.$inferSelect;
export type NewJobInterviewPrep = typeof jobInterviewPrep.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
