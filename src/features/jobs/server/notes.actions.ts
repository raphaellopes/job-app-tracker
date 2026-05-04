"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import type { JobActionResult } from "@/features/jobs/errors";
import { requireDbUserId } from "@/features/jobs/server/shared";

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
