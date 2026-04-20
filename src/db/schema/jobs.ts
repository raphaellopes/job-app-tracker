import { sql } from "drizzle-orm";
import { date, integer, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users";

export const jobStatusEnum = pgEnum("job_status", [
  "WISHLIST",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
]);

export const JOB_STATUSES = jobStatusEnum.enumValues;
export type JobStatusType = (typeof JOB_STATUSES)[number];

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

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;
