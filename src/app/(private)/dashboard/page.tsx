import RecentJobsTable from "@/components/dashboard/recent-jobs-table";
import StatusDistributionCard from "@/components/dashboard/status-distribution-card";
import SuccessMetricsCard from "@/components/dashboard/success-metrics-card";
import Header from "@/components/header";

import { getDashboardStats, getRecentJobs } from "@/actions/jobs";

import { JobModal, JobViewModal } from "@/features/jobs";
import { getFormState, type JobViewSearchParams, resolveJobViewState } from "@/features/jobs";

export default async function Dashboard(props: { searchParams: Promise<JobViewSearchParams> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  const [dashboardStats, recentJobs] = await Promise.all([getDashboardStats(), getRecentJobs(4)]);

  const { jobToView, initialInterviewPrep } = await resolveJobViewState(
    searchParams.view,
    recentJobs,
  );

  return (
    <main className="p-10">
      <Header
        title="Dashboard"
        subtitle="Welcome to your job application tracker"
        addButtonDisabled={isEditing || isAdding}
      />

      <JobModal />
      <JobViewModal job={jobToView} initialInterviewPrep={initialInterviewPrep} />

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
    </main>
  );
}
