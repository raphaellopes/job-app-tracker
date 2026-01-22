'use server';

import { db } from '../db';
import { jobs } from '../db/schema';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { desc, eq, ilike, and, asc } from 'drizzle-orm';

const JobStatus = z.enum(['WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']);
export type JobStatusType = z.infer<typeof JobStatus>;


const createJobSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  jobTitle: z.string().min(1, 'Position is required'),
  status: JobStatus,
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
});

export async function createJob(formData: FormData) {
  // 1. Validate the data
  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get('companyName'),
    jobTitle: formData.get('jobTitle'),
    status: formData.get('status'),
    salaryRange: formData.get('salaryRange'),
    notes: formData.get('notes'),
  });

  // 2. Handle validation errors
  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return;
  }

  // 3. Insert into database
  await db.insert(jobs).values({
    companyName: validatedFields.data.companyName,
    jobTitle: validatedFields.data.jobTitle,
    status: validatedFields.data.status,
    salaryRange: validatedFields.data.salaryRange,
    notes: validatedFields.data.notes,
  });

  // 4. Get return path or default to /board
  const returnPath = formData.get('returnPath')?.toString() || '/board';

  // 5. Revalidate the cache so the UI updates immediately
  revalidatePath('/');
  revalidatePath('/board');
  
  // 6. Redirect to close the form
  redirect(returnPath);
}

export async function getJobs(search?: string, status?: string, sort?: string) {
  const filters = [];
  if (search) filters.push(ilike(jobs.companyName, `%${search}%`));
  if (status) filters.push(eq(jobs.status, status as JobStatusType));

  let orderBy = desc(jobs.createdAt);
  if (sort === 'date-asc') {
    orderBy = asc(jobs.createdAt);
  } else if (sort === 'salary-desc') {
    orderBy = desc(jobs.salaryRange);
  } else if (sort === 'salary-asc') {
    orderBy = asc(jobs.salaryRange);
  }

  return await db
    .select()
    .from(jobs)
    .where(and(...filters))
    .orderBy(orderBy);
}

export async function deleteJob(formData: FormData) {
  const id = Number(formData.get('id'));

  if (!id) return;

  await db.delete(jobs).where(eq(jobs.id, id));

  revalidatePath('/');
}

export async function updateJob(formData: FormData) {
  const id = Number(formData.get('id'));

  if (!id) return;

  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get('companyName'),
    jobTitle: formData.get('jobTitle'),
    status: formData.get('status'),
    salaryRange: formData.get('salaryRange'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return;
  }

  await db.update(jobs).set(validatedFields.data).where(eq(jobs.id, id));

  // Get return path or default to /board
  const returnPath = formData.get('returnPath')?.toString() || '/board';

  revalidatePath('/');
  revalidatePath('/board');
  
  // Redirect to close the form
  redirect(returnPath);
}

export async function updateJobStatus(jobId: number, newStatus: JobStatusType) {
  try {
    if (!jobId || typeof jobId !== 'number') {
      console.error('Invalid job ID:', jobId);
      return { error: 'Invalid job ID' };
    }

    // Validate status using the existing JobStatus zod enum
    const validatedStatus = JobStatus.safeParse(newStatus);
    if (!validatedStatus.success) {
      console.error('Validation Errors:', validatedStatus.error.flatten().fieldErrors);
      return { error: 'Invalid status value' };
    }

    // Update only the status field in the database
    await db
      .update(jobs)
      .set({ status: validatedStatus.data })
      .where(eq(jobs.id, jobId));

    // Revalidate the /board path after update
    revalidatePath('/board');

    return { success: true };
  } catch (error) {
    console.error('Error updating job status:', error);
    return { error: 'Failed to update job status' };
  }
}