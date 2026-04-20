"use server";

import { revalidatePath } from "next/cache";
import { and, asc, desc, eq, ilike, max } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import {
  buildFoundJobTags,
  createJobSchema,
  type JobStatusType,
  normalizeSaveFoundJobPayload,
  parseTagsInput,
  saveFoundJobSchema,
} from "@/features/jobs/server/schemas";
import {
  appliedDatePatchForStatusChange,
  getLocalDateStringForToday,
  requireDbUserId,
  type SaveJobResult,
} from "@/features/jobs/server/shared";

export async function createJob(formData: FormData): Promise<SaveJobResult> {
  const userId = await requireDbUserId();

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

  const maxPositionResult = await db
    .select({ maxPosition: max(jobs.position) })
    .from(jobs)
    .where(and(eq(jobs.userId, userId), eq(jobs.status, validatedFields.data.status)));

  const maxPosition = maxPositionResult[0]?.maxPosition ?? null;
  const newPosition = maxPosition !== null ? maxPosition + 1 : 0;

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
    ...(status !== "WISHLIST" ? { appliedDate: getLocalDateStringForToday() } : {}),
  });

  revalidatePath("/");
  revalidatePath("/board");

  return { success: true };
}

export async function getJobs(search?: string, status?: string, sort?: string) {
  const userId = await requireDbUserId();

  const filters = [eq(jobs.userId, userId)];
  if (search) filters.push(ilike(jobs.companyName, `%${search}%`));
  if (status) filters.push(eq(jobs.status, status as JobStatusType));

  const orderBy = [asc(jobs.status), asc(jobs.position)];

  if (sort === "date-asc") {
    orderBy.push(asc(jobs.createdAt));
  } else if (sort === "date-desc") {
    orderBy.push(desc(jobs.createdAt));
  } else if (sort === "salary-desc") {
    orderBy.push(desc(jobs.salaryRange));
  } else if (sort === "salary-asc") {
    orderBy.push(asc(jobs.salaryRange));
  } else {
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
