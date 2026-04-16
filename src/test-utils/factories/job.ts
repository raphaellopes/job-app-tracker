import type { Job } from "@/db/schema";

/** Baseline `Job` row for unit tests; spread overrides for each scenario. */
export function createMockJob(overrides: Partial<Job> = {}): Job {
  const now = new Date();
  return {
    id: 1,
    userId: 10,
    companyName: "Acme Corp",
    jobTitle: "Software Engineer",
    tags: [],
    status: "WISHLIST",
    position: 0,
    salaryRange: null,
    appliedDate: null,
    description: null,
    notes: null,
    externalSource: null,
    externalJobId: null,
    externalApplyLink: null,
    employerLogo: null,
    jobPublisher: null,
    employmentTypes: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}
