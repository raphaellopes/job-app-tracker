import { Header } from "@/components/header";
import { JobModal } from "@/components/job/job-modal";
import JobViewModal from "@/components/job/job-view-modal";
import { getFormState } from "@/utils/form-state";
import { getDashboardStats, getJobInterviewPrepByJobId, getRecentJobs } from "@/actions/jobs";
import { StatusDistributionCard } from "@/components/dashboard/status-distribution-card";
import SuccessMetricsCard from "@/components/dashboard/success-metrics-card";
import { RecentJobsTable } from "@/components/dashboard/recent-jobs-table";

export default async function Dashboard(props: {
  searchParams: Promise<{ edit?: string; add?: string; view?: string }>;
}) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);

  const [dashboardStats, recentJobs] = await Promise.all([getDashboardStats(), getRecentJobs(4)]);

  const jobToView = searchParams.view
    ? recentJobs.find((j) => j.id === Number(searchParams.view))
    : undefined;
  const initialInterviewPrep = jobToView ? await getJobInterviewPrepByJobId(jobToView.id) : null;

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
