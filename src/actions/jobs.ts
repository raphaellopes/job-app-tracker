"use server";

import { db } from "../db";
import { jobs } from "../db/schema";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { desc, eq, ilike, and, asc, max, count, sql, inArray, isNotNull } from "drizzle-orm";

const JobStatus = z.enum(["WISHLIST", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]);
export type JobStatusType = z.infer<typeof JobStatus>;

const createJobSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Position is required"),
  status: JobStatus,
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

function parseTagsInput(tags?: string): string[] {
  if (!tags) return [];
  return [...new Set(tags.split(",").map((tag) => tag.trim()).filter(Boolean))];
}

export async function createJob(formData: FormData) {
  // 1. Validate the data
  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    status: formData.get("status"),
    salaryRange: formData.get("salaryRange"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  });

  // 2. Handle validation errors
  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return;
  }

  // 3. Find the maximum position value for jobs with the same status
  const maxPositionResult = await db
    .select({ maxPosition: max(jobs.position) })
    .from(jobs)
    .where(eq(jobs.status, validatedFields.data.status));

  // Calculate the new position: maxPosition + 1, or 0 if no jobs exist with that status
  const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
  const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

  // 4. Insert into database with the calculated position
  await db.insert(jobs).values({
    companyName: validatedFields.data.companyName,
    jobTitle: validatedFields.data.jobTitle,
    tags: parseTagsInput(validatedFields.data.tags),
    status: validatedFields.data.status,
    position: newPosition,
    salaryRange: validatedFields.data.salaryRange,
    notes: validatedFields.data.notes,
  });

  // 5. Get return path or default to /board
  const returnPath = formData.get("returnPath")?.toString() || "/board";

  // 6. Revalidate the cache so the UI updates immediately
  revalidatePath("/");
  revalidatePath("/board");

  // 7. Redirect to close the form
  redirect(returnPath);
}

export async function getJobs(search?: string, status?: string, sort?: string) {
  const filters = [];
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

export async function deleteJob(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!id) return;

  await db.delete(jobs).where(eq(jobs.id, id));

  revalidatePath("/");
}

export async function updateJob(formData: FormData) {
  const id = Number(formData.get("id"));

  if (!id) return;

  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get("companyName"),
    jobTitle: formData.get("jobTitle"),
    status: formData.get("status"),
    salaryRange: formData.get("salaryRange"),
    notes: formData.get("notes"),
    tags: formData.get("tags"),
  });

  if (!validatedFields.success) {
    console.error("Validation Errors:", validatedFields.error.flatten().fieldErrors);
    return;
  }

  await db
    .update(jobs)
    .set({
      companyName: validatedFields.data.companyName,
      jobTitle: validatedFields.data.jobTitle,
      status: validatedFields.data.status,
      salaryRange: validatedFields.data.salaryRange,
      notes: validatedFields.data.notes,
      tags: parseTagsInput(validatedFields.data.tags),
    })
    .where(eq(jobs.id, id));

  // Get return path or default to /board
  const returnPath = formData.get("returnPath")?.toString() || "/board";

  revalidatePath("/");
  revalidatePath("/board");

  // Redirect to close the form
  redirect(returnPath);
}

export async function updateJobStatus(jobId: number, newStatus: JobStatusType) {
  try {
    if (!jobId || typeof jobId !== "number") {
      console.error("Invalid job ID:", jobId);
      return { error: "Invalid job ID" };
    }

    // Validate status using the existing JobStatus zod enum
    const validatedStatus = JobStatus.safeParse(newStatus);
    if (!validatedStatus.success) {
      console.error("Validation Errors:", validatedStatus.error.flatten().fieldErrors);
      return { error: "Invalid status value" };
    }

    // Find the maximum position value for jobs in the new status
    const maxPositionResult = await db
      .select({ maxPosition: max(jobs.position) })
      .from(jobs)
      .where(eq(jobs.status, validatedStatus.data));

    // Calculate the new position: maxPosition + 1, or 0 if no jobs exist in that status
    const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
    const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

    // Update both status and position in a single database operation
    await db
      .update(jobs)
      .set({
        status: validatedStatus.data,
        position: newPosition,
      })
      .where(eq(jobs.id, jobId));

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

        await tx.update(jobs).set(updateData).where(eq(jobs.id, jobIds[i]));
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
  // Query 1: Get status distribution using GROUP BY
  const statusDistributionResult = await db
    .select({
      status: jobs.status,
      count: count(),
    })
    .from(jobs)
    .groupBy(jobs.status);

  // Query 2: Get aggregate counts in a single query using conditional aggregation
  const aggregateResult = await db
    .select({
      totalJobs: count(),
      pipelineTotal: sql<number>`COUNT(CASE WHEN ${jobs.status} IN ('APPLIED', 'INTERVIEWING', 'OFFER') THEN 1 END)`,
      offerCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'OFFER' THEN 1 END)`,
      interviewingCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'INTERVIEWING' THEN 1 END)`,
    })
    .from(jobs);

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
  return await db
    .select()
    .from(jobs)
    .where(isNotNull(jobs.appliedDate))
    .orderBy(desc(jobs.appliedDate), desc(jobs.createdAt))
    .limit(limit);
}
