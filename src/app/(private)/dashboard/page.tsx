import { Suspense } from "react";

import Header from "@/components/header";

import {
  getFormState,
  JobModal,
  JobViewModal,
  type JobViewSearchParams,
  RecentJobsTable,
  StatusDistributionCard,
  SuccessMetricsCard,
} from "@/features/jobs";
import JobViewModalFallback from "@/features/jobs/components/job-view-modal-fallback";
import { getDashboardStats, getRecentJobs } from "@/features/jobs/server/actions";

export default async function Dashboard(props: { searchParams: Promise<JobViewSearchParams> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  return (
    <main className="p-10">
      <Header
        title="Dashboard"
        subtitle="Welcome to your job application tracker"
        addButtonDisabled={isEditing || isAdding}
      />

      <Suspense
        fallback={<DashboardContentFallback showJobViewFallback={Boolean(searchParams.view)} />}
      >
        <DashboardContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function DashboardContent({ searchParams }: { searchParams: JobViewSearchParams }) {
  const [dashboardStats, recentJobs] = await Promise.all([getDashboardStats(), getRecentJobs(4)]);
  const jobToView = searchParams.view
    ? recentJobs.find((job) => job.id === Number(searchParams.view))
    : undefined;

  return (
    <>
      <JobModal />
      <JobViewModal job={jobToView} />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusDistributionCard data={dashboardStats.statusDistribution} />
          <SuccessMetricsCard
            pipelineTotal={dashboardStats.pipelineTotal}
            offerCount={dashboardStats.offerCount}
            interviewingCount={dashboardStats.interviewingCount}
          />
        </div>

        <RecentJobsTable jobs={recentJobs} />
      </div>
    </>
  );
}

function DashboardContentFallback({ showJobViewFallback }: { showJobViewFallback: boolean }) {
  return (
    <>
      {showJobViewFallback ? <JobViewModalFallback /> : null}
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-44 rounded-lg border border-gray-100 bg-white" />
          <div className="h-44 rounded-lg border border-gray-100 bg-white" />
        </div>
        <div className="h-72 rounded-lg border border-gray-100 bg-white" />
      </div>
    </>
  );
}
