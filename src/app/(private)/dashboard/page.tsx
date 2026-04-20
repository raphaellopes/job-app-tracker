import Header from "@/components/header";

import {
  getFormState,
  JobModal,
  JobViewModal,
  type JobViewSearchParams,
  RecentJobsTable,
  resolveJobViewState,
  StatusDistributionCard,
  SuccessMetricsCard,
} from "@/features/jobs";
import { getDashboardStats, getRecentJobs } from "@/features/jobs/server/actions";

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
