"use server";

import { and, count, desc, eq, isNotNull, sql } from "drizzle-orm";

import { db } from "@/db";
import { jobs } from "@/db/schema";

import { requireDbUserId } from "@/features/jobs/server/shared";
import type { DashboardStats } from "@/features/jobs/types";

/**
 * Returns dashboard statistics including status distribution and aggregate counts.
 * Optimized to minimize database round trips using parallel queries.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
  const userId = await requireDbUserId();

  const statusDistributionResult = await db
    .select({
      status: jobs.status,
      count: count(),
    })
    .from(jobs)
    .where(eq(jobs.userId, userId))
    .groupBy(jobs.status);

  const aggregateResult = await db
    .select({
      totalJobs: count(),
      pipelineTotal: sql<number>`COUNT(CASE WHEN ${jobs.status} IN ('APPLIED', 'INTERVIEWING', 'OFFER') THEN 1 END)`,
      offerCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'OFFER' THEN 1 END)`,
      interviewingCount: sql<number>`COUNT(CASE WHEN ${jobs.status} = 'INTERVIEWING' THEN 1 END)`,
    })
    .from(jobs)
    .where(eq(jobs.userId, userId));

  const aggregates = aggregateResult[0] || {
    totalJobs: 0,
    pipelineTotal: 0,
    offerCount: 0,
    interviewingCount: 0,
  };

  return {
    statusDistribution: statusDistributionResult.map((row) => ({
      status: row.status,
      count: Number(row.count),
    })),
    pipelineTotal: Number(aggregates.pipelineTotal),
    offerCount: Number(aggregates.offerCount),
    interviewingCount: Number(aggregates.interviewingCount),
    totalJobs: Number(aggregates.totalJobs),
  };
}

/**
 * Returns the most recently applied jobs, ordered by appliedDate DESC, then createdAt DESC.
 * Only returns jobs that have an appliedDate set.
 * @param limit - Maximum number of jobs to return (default: 4)
 */
export async function getRecentJobs(limit: number = 4): Promise<(typeof jobs.$inferSelect)[]> {
  const userId = await requireDbUserId();

  return await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.userId, userId), isNotNull(jobs.appliedDate)))
    .orderBy(desc(jobs.appliedDate), desc(jobs.createdAt))
    .limit(limit);
}
