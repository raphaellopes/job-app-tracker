"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { and, asc, count, desc, eq, ilike, inArray, isNotNull, max, sql } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { jobInterviewPrep, jobs } from "@/db/schema";

import type { InterviewPrepResult } from "@/actions/gemini";

import { getDbUserForSession } from "@/lib/auth/user";

async function requireDbUserId(): Promise<number> {
  const { session, dbUser } = await getDbUserForSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (!dbUser) {
    redirect("/sign-up/complete");
  }
  return dbUser.id;
}

const JobStatus = z.enum(["WISHLIST", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]);
export type JobStatusType = z.infer<typeof JobStatus>;

const createJobSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Position is required"),
  status: JobStatus,
  salaryRange: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

const interviewPrepSchema = z.object({
  suggestedSkills: z.array(z.string().min(1)).min(1),
  mockQuestions: z.array(z.string().min(1)).min(1),
  resumeMatchScore: z.number().int().min(0).max(100),
  tips: z.string().min(1),
});

const MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES = 10;
const MAX_SAVE_FOUND_JOB_LIST_ITEMS = 20;

const saveFoundJobSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Employer name is required"),
  description: z.string().optional(),
  salaryRange: z.string().optional(),
  externalJobId: z.string().min(1),
  externalApplyLink: z.string().url().optional(),
  employerLogo: z.string().url().optional(),
  jobPublisher: z.string().min(1).optional(),
  employmentTypes: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES).optional(),
  isRemote: z.boolean().optional(),
  employerCompanyType: z.string().min(1).optional(),
  naicsName: z.string().min(1).optional(),
  locationTag: z.string().min(1).optional(),
  requiredSkills: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_LIST_ITEMS).optional(),
  highlightQualifications: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_LIST_ITEMS).optional(),
  highlightResponsibilities: z
    .array(z.string().min(1))
    .max(MAX_SAVE_FOUND_JOB_LIST_ITEMS)
    .optional(),
});

type SaveFoundJobPayload = z.infer<typeof saveFoundJobSchema>;

function normalizeSaveFoundJobPayload(payload: SaveFoundJobPayload): SaveFoundJobPayload {
  return {
    ...payload,
    employmentTypes: payload.employmentTypes?.slice(0, MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES),
    requiredSkills: payload.requiredSkills?.slice(0, MAX_SAVE_FOUND_JOB_LIST_ITEMS),
    highlightQualifications: payload.highlightQualifications?.slice(
      0,
      MAX_SAVE_FOUND_JOB_LIST_ITEMS,
    ),
    highlightResponsibilities: payload.highlightResponsibilities?.slice(
      0,
      MAX_SAVE_FOUND_JOB_LIST_ITEMS,
    ),
  };
}

const MAX_SAVED_TAGS = 10;
const MAX_HIGHLIGHT_TAG_LENGTH = 60;

function parseTagsInput(tags?: string): string[] {
  if (!tags) return [];
  return [
    ...new Set(
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ");
}

function appendTag(tags: string[], seen: Set<string>, value?: string) {
  if (!value || tags.length >= MAX_SAVED_TAGS) {
    return;
  }

  const normalized = normalizeTag(value);
  if (!normalized) {
    return;
  }

  const key = normalized.toLowerCase();
  if (seen.has(key)) {
    return;
  }

  tags.push(normalized);
  seen.add(key);
}

function buildFoundJobTags(payload: z.infer<typeof saveFoundJobSchema>): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const employmentType of payload.employmentTypes ?? []) {
    appendTag(tags, seen, employmentType);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  if (payload.isRemote) {
    appendTag(tags, seen, "Remote");
  }
  appendTag(tags, seen, payload.jobPublisher);
  appendTag(tags, seen, payload.employerCompanyType);
  appendTag(tags, seen, payload.naicsName);
  appendTag(tags, seen, payload.locationTag);

  for (const skill of payload.requiredSkills ?? []) {
    appendTag(tags, seen, skill);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  const highlights = [
    ...(payload.highlightQualifications ?? []),
    ...(payload.highlightResponsibilities ?? []),
  ];
  for (const highlight of highlights) {
    const normalizedHighlight = normalizeTag(highlight);
    if (!normalizedHighlight || normalizedHighlight.length > MAX_HIGHLIGHT_TAG_LENGTH) {
      continue;
    }
    appendTag(tags, seen, normalizedHighlight);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  return tags;
}

export type SaveJobResult = { success: true } | { error: string };

function localDateStringForToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** How `appliedDate` should change when status changes; empty object = leave DB value as-is. */
function appliedDatePatchForStatusChange(
  prevStatus: JobStatusType,
  nextStatus: JobStatusType,
): { appliedDate: string | null } | Record<string, never> {
  if (prevStatus === nextStatus) {
    return {};
  }
  if (nextStatus === "WISHLIST") {
    return { appliedDate: null };
  }
  if (prevStatus === "WISHLIST") {
    return { appliedDate: localDateStringForToday() };
  }
  return {};
}

export async function createJob(formData: FormData): Promise<SaveJobResult> {
  const userId = await requireDbUserId();

  // 1. Validate the data
  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    status: formData.get("status"),
    salaryRange: formData.get("salaryRange"),
    description: formData.get("description"),
    tags: formData.get("tags"),
  });

  // 2. Handle validation errors
  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return { error: "validation_failed" };
  }

  // 3. Find the maximum position value for jobs with the same status
  const maxPositionResult = await db
    .select({ maxPosition: max(jobs.position) })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, validatedFields.data.status)));

  // Calculate the new position: maxPosition + 1, or 0 if no jobs exist with that status
  const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
  const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

  // 4. Insert into database with the calculated position
  const status = validatedFields.data.status;
  await db.insert(jobs).values({
    userId,
    companyName: validatedFields.data.companyName,
    jobTitle: validatedFields.data.jobTitle,
    tags: parseTagsInput(validatedFields.data.tags),
    status,
    position: newPosition,
    salaryRange: validatedFields.data.salaryRange,
    description: validatedFields.data.description,
    ...(status !== "WISHLIST" ? { appliedDate: localDateStringForToday() } : {}),
  });

  // 5. Revalidate the cache so the UI updates immediately
  revalidatePath("/");
  revalidatePath("/board");

  return { success: true };
}

export async function getJobs(search?: string, status?: string, sort?: string) {
  const userId = await requireDbUserId();

  const filters = [eq(jobs.userId, userId)];
  if (search) filters.push(ilike(jobs.companyName, `%${search}%`));
  if (status) filters.push(eq(jobs.status, status as JobStatusType));

  // Base ordering: status -> position (asc) -> createdAt (desc)
  const orderBy = [asc(jobs.status), asc(jobs.position)];

  // Apply custom sort if specified (replaces createdAt fallback)
  if (sort === "date-asc") {
    orderBy.push(asc(jobs.createdAt));
  } else if (sort === "date-desc") {
    orderBy.push(desc(jobs.createdAt));
  } else if (sort === "salary-desc") {
    orderBy.push(desc(jobs.salaryRange));
  } else if (sort === "salary-asc") {
    orderBy.push(asc(jobs.salaryRange));
  } else {
    // Default fallback: createdAt (desc)
    orderBy.push(desc(jobs.createdAt));
  }

  return await db
    .select()
    .from(jobs)
    .where(and(...filters))
    .orderBy(...orderBy);
}

export async function saveFoundJob(
  payload: z.infer<typeof saveFoundJobSchema>,
): Promise<{ success: true } | { error: string }> {
  const userId = await requireDbUserId();

  const validatedPayload = saveFoundJobSchema.safeParse(normalizeSaveFoundJobPayload(payload));
  if (!validatedPayload.success) {
    return { error: "validation_failed" };
  }

  const data = validatedPayload.data;
  const [existingJob] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.userId, userId),
        eq(jobs.externalSource, "JSEARCH"),
        eq(jobs.externalJobId, data.externalJobId),
      ),
    )
    .limit(1);

  if (existingJob) {
    return { error: "already_saved" };
  }

  const maxPositionResult = await db
    .select({ maxPosition: max(jobs.position) })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, "WISHLIST")));

  const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
  const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

  await db.insert(jobs).values({
    userId,
    companyName: data.companyName,
    jobTitle: data.jobTitle,
    description: data.description,
    salaryRange: data.salaryRange,
    status: "WISHLIST",
    position: newPosition,
    tags: buildFoundJobTags(data),
    externalSource: "JSEARCH",
    externalJobId: data.externalJobId,
    externalApplyLink: data.externalApplyLink,
    employerLogo: data.employerLogo,
    jobPublisher: data.jobPublisher,
    employmentTypes: data.employmentTypes ?? [],
  });

  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/job-finder");

  return { success: true };
}

export async function deleteJob(formData: FormData): Promise<SaveJobResult> {
  const userId = await requireDbUserId();

  const id = Number(formData.get("id"));

  if (!id) {
    return { error: "invalid_id" };
  }

  await db.delete(jobs).where(and(eq(jobs.id, id), eq(jobs.userId, userId)));

  revalidatePath("/");
  revalidatePath("/board");

  return { success: true };
}

export async function updateJob(formData: FormData): Promise<SaveJobResult> {
  const userId = await requireDbUserId();

  const id = Number(formData.get("id"));

  if (!id) {
    return { error: "invalid_id" };
  }

  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    status: formData.get("status"),
    salaryRange: formData.get("salaryRange"),
    description: formData.get("description"),
    tags: formData.get("tags"),
  });

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return { error: "validation_failed" };
  }

  const [existing] = await db
    .select({ status: jobs.status })
    .from(jobs)
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)))
    .limit(1);

  if (!existing) {
    return { error: "not_found" };
  }

  const appliedPatch = appliedDatePatchForStatusChange(
    existing.status,
    validatedFields.data.status,
  );

  await db
    .update(jobs)
    .set({
      companyName: validatedFields.data.companyName,
      jobTitle: validatedFields.data.jobTitle,
      status: validatedFields.data.status,
      salaryRange: validatedFields.data.salaryRange,
      description: validatedFields.data.description,
      tags: parseTagsInput(validatedFields.data.tags),
      ...appliedPatch,
    })
    .where(and(eq(jobs.id, id), eq(jobs.userId, userId)));

  revalidatePath("/");
  revalidatePath("/board");

  return { success: true };
}

export async function updateJobStatus(jobId: number, newStatus: JobStatusType) {
  try {
    const userId = await requireDbUserId();

    if (!jobId || typeof jobId !== "number") {
      console.error("Invalid job ID:", jobId);
      return { error: "Invalid job ID" };
    }

    const validatedStatus = JobStatus.safeParse(newStatus);
    if (!validatedStatus.success) {
      console.error("Validation Errors:", validatedStatus.error.flatten().fieldErrors);
      return { error: "Invalid status value" };
    }

    const [existing] = await db
      .select({ status: jobs.status })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);

    if (!existing) {
      return { error: "Job not found" };
    }

    // Find the maximum position value for jobs in the new status
    const maxPositionResult = await db
      .select({ maxPosition: max(jobs.position) })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), eq(jobs.status, validatedStatus.data)));

    // Calculate the new position: maxPosition + 1, or 0 if no jobs exist in that status
    const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
    const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

    const appliedPatch = appliedDatePatchForStatusChange(existing.status, validatedStatus.data);

    // Update both status and position in a single database operation
    await db
      .update(jobs)
      .set({
        status: validatedStatus.data,
        position: newPosition,
        ...appliedPatch,
      })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

    // Revalidate the /board path after update
    revalidatePath("/board");

    return { success: true };
  } catch (error) {
    console.error("Error updating job status:", error);
    return { error: "Failed to update job status" };
  }
}

export async function updateJobPositions(
  jobIds: number[],
  status?: JobStatusType,
): Promise<{ success: true } | { error: string }> {
  try {
    const userId = await requireDbUserId();

    // Validate inputs
    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return { error: "Job IDs array is required and cannot be empty" };
    }

    // Validate all job IDs are numbers
    if (!jobIds.every((id) => typeof id === "number" && id > 0)) {
      return { error: "All job IDs must be valid positive numbers" };
    }

    // Validate status if provided
    if (status) {
      const validatedStatus = JobStatus.safeParse(status);
      if (!validatedStatus.success) {
        return { error: "Invalid status value" };
      }
    }

    const owned = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), inArray(jobs.id, jobIds)));

    if (owned.length !== jobIds.length) {
      return { error: "Invalid job IDs" };
    }

    // Use transaction to ensure all updates happen atomically
    await db.transaction(async (tx) => {
      // Update position for each job based on its index in the array
      for (let i = 0; i < jobIds.length; i++) {
        const updateData: { position: number; status?: JobStatusType } = {
          position: i,
        };

        // If status is provided, also update it (for when jobs move between columns)
        if (status) {
          updateData.status = status;
        }

        await tx
          .update(jobs)
          .set(updateData)
          .where(and(eq(jobs.id, jobIds[i]), eq(jobs.userId, userId)));
      }
    });

    // Revalidate the /board path after update
    revalidatePath("/board");

    return { success: true };
  } catch (error) {
    console.error("Error updating job positions:", error);
    return { error: "Failed to update job positions" };
  }
}

export async function updateJobNotes(
  jobId: number,
  notes: string,
): Promise<{ success: true } | { error: string }> {
  try {
    const userId = await requireDbUserId();

    if (!jobId || typeof jobId !== "number") {
      return { error: "Invalid job ID" };
    }

    if (typeof notes !== "string") {
      return { error: "Invalid notes value" };
    }

    const updated = await db
      .update(jobs)
      .set({ notes })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .returning({ id: jobs.id });

    if (updated.length === 0) {
      return { error: "Job not found" };
    }

    revalidatePath("/board");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating job notes:", error);
    return { error: "Failed to update job notes" };
  }
}

export async function getJobInterviewPrepByJobId(
  jobId: number,
): Promise<InterviewPrepResult | null> {
  if (!jobId || typeof jobId !== "number") {
    return null;
  }

  const userId = await requireDbUserId();

  const [owned] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
    .limit(1);

  if (!owned) {
    return null;
  }

  const prep = await db.query.jobInterviewPrep.findFirst({
    where: eq(jobInterviewPrep.jobId, jobId),
  });

  if (!prep) {
    return null;
  }

  return {
    suggestedSkills: prep.suggestedSkills,
    mockQuestions: prep.mockQuestions,
    resumeMatchScore: prep.resumeMatchScore,
    tips: prep.tips,
  };
}

export async function saveJobInterviewPrep(
  jobId: number,
  prep: InterviewPrepResult,
): Promise<{ success: true } | { error: string }> {
  try {
    const userId = await requireDbUserId();

    if (!jobId || typeof jobId !== "number") {
      return { error: "Invalid job ID" };
    }

    const [owned] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);

    if (!owned) {
      return { error: "Job not found" };
    }

    const validatedPrep = interviewPrepSchema.safeParse(prep);
    if (!validatedPrep.success) {
      return { error: "Invalid interview prep payload" };
    }

    await db
      .insert(jobInterviewPrep)
      .values({
        jobId,
        suggestedSkills: validatedPrep.data.suggestedSkills,
        mockQuestions: validatedPrep.data.mockQuestions,
        resumeMatchScore: validatedPrep.data.resumeMatchScore,
        tips: validatedPrep.data.tips,
      })
      .onConflictDoUpdate({
        target: jobInterviewPrep.jobId,
        set: {
          suggestedSkills: validatedPrep.data.suggestedSkills,
          mockQuestions: validatedPrep.data.mockQuestions,
          resumeMatchScore: validatedPrep.data.resumeMatchScore,
          tips: validatedPrep.data.tips,
          updatedAt: new Date(),
        },
      });

    revalidatePath("/board");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error saving interview prep:", error);
    return { error: "Failed to save interview prep" };
  }
}

export interface DashboardStats {
  statusDistribution: Array<{ status: string; count: number }>;
  pipelineTotal: number;
  offerCount: number;
  interviewingCount: number;
  totalJobs: number;
}

/**
 * Returns dashboard statistics including status distribution and aggregate counts.
 * Optimized to minimize database round trips using parallel queries.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await requireDbUserId();

  // Query 1: Get status distribution using GROUP BY
  const statusDistributionResult = await db
    .select({
      status: jobs.status,
      count: count(),
    })
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .groupBy(jobs.status);

  // Query 2: Get aggregate counts in a single query using conditional aggregation
  const aggregateResult = await db
    .select({
      totalJobs: count(),
      pipelineTotal: sql<number>`COUNT(CASE WHEN ${jobs.status} IN ('APPLIED', 'INTERVIEWING', 'OFFER') THEN 1 END)`,
      offerCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'OFFER' THEN 1 END)`,
      interviewingCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'INTERVIEWING' THEN 1 END)`,
    })
    .from(jobs)
    .where(eq(jobs.userId, userId));

  const aggregates = aggregateResult[0] || {
    totalJobs: 0,
    pipelineTotal: 0,
    offerCount: 0,
    interviewingCount: 0,
  };

  return {
    statusDistribution: statusDistributionResult.map((row) => ({
      status: row.status,
      count: Number(row.count),
    })),
    pipelineTotal: Number(aggregates.pipelineTotal),
    offerCount: Number(aggregates.offerCount),
    interviewingCount: Number(aggregates.interviewingCount),
    totalJobs: Number(aggregates.totalJobs),
  };
}

/**
 * Returns the most recently applied jobs, ordered by appliedDate DESC, then createdAt DESC.
 * Only returns jobs that have an appliedDate set.
 * @param limit - Maximum number of jobs to return (default: 4)
 */
export async function getRecentJobs(limit: number = 4): Promise<(typeof jobs.$inferSelect)[]> {
  const userId = await requireDbUserId();

  return await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), isNotNull(jobs.appliedDate)))
    .orderBy(desc(jobs.appliedDate), desc(jobs.createdAt))
    .limit(limit);
}
