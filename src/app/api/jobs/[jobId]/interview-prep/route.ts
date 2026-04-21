import { NextResponse } from "next/server";

import { getJobInterviewPrepByJobId } from "@/features/ai-interview-prep/server";

interface RouteParams {
  params: Promise<{
    jobId: string;
  }>;
}

export async function GET(_: Request, { params }: RouteParams) {
  const { jobId } = await params;
  const parsedJobId = Number(jobId);

  if (!jobId || Number.isNaN(parsedJobId)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 });
  }

  const data = await getJobInterviewPrepByJobId(parsedJobId);
  return NextResponse.json({ data }, { status: 200 });
}
