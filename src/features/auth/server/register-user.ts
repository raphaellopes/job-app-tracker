"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { users } from "@/db/schema";

import { firebaseAdminAuth } from "@/lib/firebase/admin";

import type { AuthRegisterResult } from "@/features/auth/errors";

const registerUserSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  email: z.email("Enter a valid email address").trim(),
  idToken: z.string().min(1, "Authentication token is required"),
});

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

export type RegisterUserResult = AuthRegisterResult;

export async function registerUser(formData: FormData): Promise<AuthRegisterResult> {
  const validated = registerUserSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    idToken: formData.get("idToken"),
  });

  if (!validated.success) {
    return { error: "validation_failed" };
  }

  const { firstName, lastName, email, idToken } = validated.data;
  const emailNormalized = email.toLowerCase();

  let decodedToken;
  try {
    decodedToken = await firebaseAdminAuth.verifyIdToken(idToken);
  } catch (error) {
    console.error("registerUser: verifyIdToken failed:", error);
    return { error: "internal_error" };
  }

  if (!decodedToken.email || decodedToken.email.toLowerCase() !== emailNormalized) {
    return { error: "email_token_mismatch" };
  }

  try {
    const existing = await db.query.users.findFirst({
      where: eq(users.firebaseUid, decodedToken.uid),
    });

    if (existing) {
      await db
        .update(users)
        .set({
          firstName,
          lastName,
          email: emailNormalized,
        })
        .where(eq(users.id, existing.id));
    } else {
      await db.insert(users).values({
        firebaseUid: decodedToken.uid,
        firstName,
        lastName,
        email: emailNormalized,
      });
    }
  } catch (error) {
    if (isPostgresUniqueViolation(error)) {
      return { error: "email_already_exists" };
    }
    console.error("registerUser: database error:", error);
    return { error: "internal_error" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
