'use server';

import { db } from '../db';
import { jobs } from '../db/schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

const createJobSchema = z.object({
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  status: z.enum(['WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']),
  salaryRange: z.string().optional(),
  notes: z.string().optional(),
});

export async function createJob(formData: FormData) {
  // 1. Validate the data
  const validatedFields = createJobSchema.safeParse({
    companyName: formData.get('companyName'),
    position: formData.get('position'),
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
    position: validatedFields.data.position,
    status: validatedFields.data.status,
    salaryRange: validatedFields.data.salaryRange,
    notes: validatedFields.data.notes,
  });

  // 4. Revalidate the cache so the UI updates immediately
  revalidatePath('/');
}

export async function getJobs() {
  return await db.select().from(jobs).orderBy(desc(jobs.createdAt));
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
    position: formData.get('position'),
    status: formData.get('status'),
    salaryRange: formData.get('salaryRange'),
    notes: formData.get('notes'),
  });

  if (!validatedFields.success) {
    console.error('Validation Errors:', validatedFields.error.flatten().fieldErrors);
    return;
  }

  await db.update(jobs).set(validatedFields.data).where(eq(jobs.id, id));

  revalidatePath('/');
}