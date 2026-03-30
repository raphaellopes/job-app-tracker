import { Header } from "@/components/header";
import { JobModal } from "@/components/modals/job-modal";
import { getFormState } from "@/utils/form-state";
import { getDashboardStats, getRecentJobs } from "@/actions/jobs";
import { StatusDistributionCard } from "@/components/dashboard/status-distribution-card";
import { SuccessMetricsCard } from "@/components/dashboard/success-metrics-card";
import { RecentJobsTable } from "@/components/dashboard/recent-jobs-table";

export default async function Dashboard(props: {
  searchParams: Promise<{ edit?: string; add?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  // Fetch dashboard data
  const [dashboardStats, recentJobs] = await Promise.all([getDashboardStats(), getRecentJobs(4)]);

  return (
    <main className="p-10">
      <Header
        title="Dashboard"
        subtitle="Welcome to your job application tracker"
        addButtonDisabled={isEditing || isAdding}
      />

      <JobModal />

      <div className="space-y-6">
        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StatusDistributionCard data={dashboardStats.statusDistribution} />
          <SuccessMetricsCard
            pipelineTotal={dashboardStats.pipelineTotal}
            offerCount={dashboardStats.offerCount}
            interviewingCount={dashboardStats.interviewingCount}
          />
        </div>

        {/* Recent Jobs Table */}
        <RecentJobsTable jobs={recentJobs} />
      </div>
    </main>
  );
}
