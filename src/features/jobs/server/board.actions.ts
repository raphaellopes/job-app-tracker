"use server";

import { revalidatePath } from "next/cache";
import { and, eq, inArray, max } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import type { JobActionResult } from "@/features/jobs/errors";
import { JobStatus, type JobStatusType } from "@/features/jobs/server/schemas";
import { appliedDatePatchForStatusChange, requireDbUserId } from "@/features/jobs/server/shared";

export async function updateJobStatus(
  jobId: number,
  newStatus: JobStatusType,
): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    if (!jobId || typeof jobId !== "number") {
      console.error("Invalid job ID:", jobId);
      return { error: "invalid_id" };
    }

    const validatedStatus = JobStatus.safeParse(newStatus);
    if (!validatedStatus.success) {
      console.error("Validation Errors:", validatedStatus.error.flatten().fieldErrors);
      return { error: "invalid_status" };
    }

    const [existing] = await db
      .select({ status: jobs.status })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);

    if (!existing) {
      return { error: "not_found" };
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
    return { error: "internal_error" };
  }
}

export async function updateJobPositions(
  jobIds: number[],
  status?: JobStatusType,
): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    if (!Array.isArray(jobIds) || jobIds.length === 0) {
      return { error: "empty_job_ids" };
    }

    if (!jobIds.every((id) => typeof id === "number" && id > 0)) {
      return { error: "invalid_job_ids" };
    }

    if (status) {
      const validatedStatus = JobStatus.safeParse(status);
      if (!validatedStatus.success) {
        return { error: "invalid_status" };
      }
    }

    const owned = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), inArray(jobs.id, jobIds)));

    if (owned.length !== jobIds.length) {
      return { error: "job_ids_not_found" };
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
    return { error: "internal_error" };
  }
}

export async function updateJobNotes(jobId: number, notes: string): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    if (!jobId || typeof jobId !== "number") {
      return { error: "invalid_id" };
    }

    if (typeof notes !== "string") {
      return { error: "invalid_notes" };
    }

    const updated = await db
      .update(jobs)
      .set({ notes })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .returning({ id: jobs.id });

    if (updated.length === 0) {
      return { error: "not_found" };
    }

    revalidatePath("/board");
    revalidatePath("/");

    return { success: true };
  } catch (error) {
    console.error("Error updating job notes:", error);
    return { error: "internal_error" };
  }
}
