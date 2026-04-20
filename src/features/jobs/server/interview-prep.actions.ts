"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { jobInterviewPrep, jobs } from "@/db/schema";

import type { InterviewPrepResult } from "@/features/ai-interview-prep/types";
import { interviewPrepSchema } from "@/features/jobs/server/schemas";
import { requireDbUserId } from "@/features/jobs/server/shared";

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
