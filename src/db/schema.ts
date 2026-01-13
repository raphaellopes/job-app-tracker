import { pgTable, serial, text, timestamp, date, pgEnum } from 'drizzle-orm/pg-core';

export const jobStatusEnum = pgEnum('job_status', [
  'WISHLIST',
  'APPLIED',
  'INTERVIEWING',
  'OFFER',
  'REJECTED',
]);

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  companyName: text('company_name').notNull(),
  position: text('position').notNull(),
  status: jobStatusEnum('status').default('WISHLIST').notNull(),
  salaryRange: text('salary_range'),
  appliedDate: date('applied_date'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;