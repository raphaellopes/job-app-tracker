"use server";

import { revalidatePath } from "next/cache";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import type { JobActionResult } from "@/features/jobs/errors";
import { getJobIdByExternalJobId } from "@/features/jobs/server/job-finder-states";
import {
  buildFoundJobTags,
  normalizeSaveFoundJobPayload,
  saveFoundJobSchema,
} from "@/features/jobs/server/schemas";
import { requireDbUserId } from "@/features/jobs/server/shared";

const JSEARCH_SOURCE = "JSEARCH";

function revalidateJobPaths() {
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/job-finder");
}

export async function markJobNotApplicable(jobId: number): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    if (!jobId) {
      return { error: "invalid_id" };
    }

    const [existing] = await db
      .select({ id: jobs.id })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);

    if (!existing) {
      return { error: "not_found" };
    }

    await db
      .update(jobs)
      .set({ status: "NOT_A_FIT", appliedDate: null })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

    revalidateJobPaths();
    return { success: true };
  } catch (error) {
    console.error("Error marking job as not applicable:", error);
    return { error: "internal_error" };
  }
}

export async function dismissFoundJob(
  payload: z.infer<typeof saveFoundJobSchema>,
): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    const validatedPayload = saveFoundJobSchema.safeParse(normalizeSaveFoundJobPayload(payload));
    if (!validatedPayload.success) {
      return { error: "validation_failed" };
    }

    const data = validatedPayload.data;
    const [existingJob] = await db
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(
        and(
          eq(jobs.userId, userId),
          eq(jobs.externalSource, JSEARCH_SOURCE),
          eq(jobs.externalJobId, data.externalJobId),
        ),
      )
      .limit(1);

    if (existingJob) {
      if (existingJob.status === "NOT_A_FIT") {
        return { success: true };
      }

      await db
        .update(jobs)
        .set({ status: "NOT_A_FIT", appliedDate: null })
        .where(and(eq(jobs.id, existingJob.id), eq(jobs.userId, userId)));

      revalidateJobPaths();
      return { success: true };
    }

    await db.insert(jobs).values({
      userId,
      companyName: data.companyName,
      jobTitle: data.jobTitle,
      description: data.description,
      salaryRange: data.salaryRange,
      status: "NOT_A_FIT",
      position: 0,
      tags: buildFoundJobTags(data),
      externalSource: JSEARCH_SOURCE,
      externalJobId: data.externalJobId,
      externalApplyLink: data.externalApplyLink,
      employerLogo: data.employerLogo,
      jobPublisher: data.jobPublisher,
      employmentTypes: data.employmentTypes ?? [],
    });

    revalidateJobPaths();
    return { success: true };
  } catch (error) {
    console.error("Error dismissing found job:", error);
    return { error: "internal_error" };
  }
}

export async function restoreJob(jobId: number): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();

    if (!jobId) {
      return { error: "invalid_id" };
    }

    const [existing] = await db
      .select({ id: jobs.id, status: jobs.status })
      .from(jobs)
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)))
      .limit(1);

    if (!existing) {
      return { error: "not_found" };
    }

    if (existing.status !== "NOT_A_FIT") {
      return { error: "invalid_status" };
    }

    const maxPositionResult = await db
      .select({ maxPosition: max(jobs.position) })
      .from(jobs)
      .where(and(eq(jobs.userId, userId), eq(jobs.status, "WISHLIST")));

    const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
    const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

    await db
      .update(jobs)
      .set({
        status: "WISHLIST",
        position: newPosition,
        appliedDate: null,
      })
      .where(and(eq(jobs.id, jobId), eq(jobs.userId, userId)));

    revalidateJobPaths();
    return { success: true };
  } catch (error) {
    console.error("Error restoring job:", error);
    return { error: "internal_error" };
  }
}

export async function restoreFoundJob(externalJobId: string): Promise<JobActionResult> {
  try {
    const userId = await requireDbUserId();
    const jobId = await getJobIdByExternalJobId(userId, externalJobId);

    if (!jobId) {
      return { error: "not_found" };
    }

    return restoreJob(jobId);
  } catch (error) {
    console.error("Error restoring found job:", error);
    return { error: "internal_error" };
  }
}
