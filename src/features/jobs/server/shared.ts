import { redirect } from "next/navigation";

import { getDbUserForSession } from "@/features/auth/server";
import type { JobStatusType } from "@/features/jobs/types";

export type SaveJobResult = { success: true } | { error: string };

export async function requireDbUserId(): Promise<number> {
  const { session, dbUser } = await getDbUserForSession();
  if (!session) {
    redirect("/sign-in");
  }
  if (!dbUser) {
    redirect("/sign-up/complete");
  }
  return dbUser.id;
}

function localDateStringForToday(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** How `appliedDate` should change when status changes; empty object = leave DB value as-is. */
export function appliedDatePatchForStatusChange(
  prevStatus: JobStatusType,
  nextStatus: JobStatusType,
): { appliedDate: string | null } | Record<string, never> {
  if (prevStatus === nextStatus) {
    return {};
  }
  if (nextStatus === "WISHLIST") {
    return { appliedDate: null };
  }
  if (prevStatus === "WISHLIST") {
    return { appliedDate: localDateStringForToday() };
  }
  return {};
}

export function getLocalDateStringForToday(): string {
  return localDateStringForToday();
}
