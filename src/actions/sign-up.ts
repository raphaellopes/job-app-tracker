"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address").trim(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(32, "Username must be at most 32 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
});

export type RegisterUserResult = { ok: true } | { ok: false; message: string };

/**
 * @TODO: Check if this is the correct way to check for unique violations. The code seems
 *        to be a bit weird. What's the code === "23505" means?
 */
function isPostgresUniqueViolation(error: unknown): boolean {
  const code =
    error && typeof error === "object" && "code" in error
      ? (error as { code: unknown }).code
      : undefined;
  if (code === "23505") return true;
  if (error && typeof error === "object" && "cause" in error) {
    return isPostgresUniqueViolation((error as { cause: unknown }).cause);
  }
  return false;
}

export async function registerUser(formData: FormData): Promise<RegisterUserResult> {
  const validated = registerUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    username: formData.get("username"),
  });

  if (!validated.success) {
    const first = Object.values(validated.error.flatten().fieldErrors)[0]?.[0];
    return { ok: false, message: first ?? "Invalid input." };
  }

  const { firstName, lastName, email, username } = validated.data;
  const emailNormalized = email.toLowerCase();

  try {
    await db.insert(users).values({
      firstName,
      lastName,
      email: emailNormalized,
      username,
    });
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      return {
        ok: false,
        message: "An account with this email or username already exists.",
      };
    }
    throw error;
  }

  revalidatePath("/");
  return { ok: true };
}
