import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import type { JobFinderUserState } from "@/features/job-finder/types";

const JSEARCH_SOURCE = "JSEARCH";

/**
 * Returns a map of external job IDs to the user's tracking state for Job Finder enrichment.
 */
export async function getJobFinderUserStates(
  userId: number,
  externalJobIds: string[],
): Promise<Map<string, JobFinderUserState>> {
  const result = new Map<string, JobFinderUserState>();

  if (externalJobIds.length === 0) {
    return result;
  }

  const rows = await db
    .select({
      externalJobId: jobs.externalJobId,
      status: jobs.status,
    })
    .from(jobs)
    .where(
      and(
        eq(jobs.userId, userId),
        eq(jobs.externalSource, JSEARCH_SOURCE),
        inArray(jobs.externalJobId, externalJobIds),
      ),
    );

  for (const row of rows) {
    if (!row.externalJobId) {
      continue;
    }
    result.set(row.externalJobId, row.status === "NOT_A_FIT" ? "not_a_fit" : "saved");
  }

  return result;
}

export async function getJobIdByExternalJobId(
  userId: number,
  externalJobId: string,
): Promise<number | null> {
  const [row] = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.userId, userId),
        eq(jobs.externalSource, JSEARCH_SOURCE),
        eq(jobs.externalJobId, externalJobId),
      ),
    )
    .limit(1);

  return row?.id ?? null;
}
