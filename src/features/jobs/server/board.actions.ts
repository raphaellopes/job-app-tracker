"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, max } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import { JobStatus, type JobStatusType } from "@/features/jobs/server/schemas";
import { appliedDatePatchForStatusChange, requireDbUserId } from "@/features/jobs/server/shared";

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

    const maxPositionResult = await db
      .select({ maxPosition: max(jobs.position) })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), eq(jobs.status, validatedStatus.data)));

    const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
    const newPosition = maxPosition !== null ? maxPosition + 1 : 0;
    const appliedPatch = appliedDatePatchForStatusChange(existing.status, validatedStatus.data);

    await db
      .update(jobs)
      .set({
        status: validatedStatus.data,
        position: newPosition,
        ...appliedPatch,
      })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

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

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return { error: "Job IDs array is required and cannot be empty" };
    }

    if (!jobIds.every((id) => typeof id === "number" && id > 0)) {
      return { error: "All job IDs must be valid positive numbers" };
    }

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

    await db.transaction(async (tx) => {
      for (let i = 0; i < jobIds.length; i++) {
        const updateData: { position: number; status?: JobStatusType } = {
          position: i,
        };

        if (status) {
          updateData.status = status;
        }

        await tx
          .update(jobs)
          .set(updateData)
          .where(and(eq(jobs.id, jobIds[i]), eq(jobs.userId, userId)));
      }
    });

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
