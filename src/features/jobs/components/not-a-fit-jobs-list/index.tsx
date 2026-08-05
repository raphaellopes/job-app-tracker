"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@/components/buttons/button";

import DeleteJobButton from "@/features/jobs/components/delete-job-button";
import { jobErrorMessage } from "@/features/jobs/errors";
import { jobsKeys } from "@/features/jobs/query-keys";
import { restoreJob } from "@/features/jobs/server/actions";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

interface NotAFitJobsListProps {
  jobs: Job[];
  filters?: JobsBoardFilters;
}

function formatDismissedDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const RestoreJobButton: React.FC<{ jobId: number }> = ({ jobId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleRestore = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await restoreJob(jobId);
      if ("success" in result && result.success) {
        await queryClient.invalidateQueries({ queryKey: jobsKeys.all });
        toast.success("Job restored to wishlist.");
      } else if ("error" in result) {
        toast.error(jobErrorMessage(result.error));
      }
      router.refresh();
    } catch (error) {
      console.error("Error restoring job:", error);
      toast.error("Something went wrong while restoring the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleRestore} disabled={isSubmitting}>
      {isSubmitting ? "Restoring..." : "Restore to wishlist"}
    </Button>
  );
};

const NotAFitJobsList: React.FC<NotAFitJobsListProps> = ({ jobs }) => {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white p-8 text-sm text-gray-600">
        No jobs marked as not a fit.
      </div>
    );
  }

  return (
    <div className="w-full flex-1 overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="grid grid-cols-12 gap-3 border-b border-gray-200 px-4 py-3 text-xs font-semibold uppercase text-gray-500">
        <span className="col-span-3">Company</span>
        <span className="col-span-4">Title</span>
        <span className="col-span-3">Marked on</span>
        <span className="col-span-2 text-right">Actions</span>
      </div>
      {jobs.map((job) => (
        <div
          key={job.id}
          className="grid grid-cols-12 items-center gap-3 border-b border-gray-100 px-4 py-3 text-sm last:border-b-0"
        >
          <span className="col-span-3 font-medium text-gray-900">{job.companyName}</span>
          <span className="col-span-4 text-gray-700">{job.jobTitle}</span>
          <span className="col-span-3 text-gray-500">{formatDismissedDate(job.updatedAt)}</span>
          <div className="col-span-2 flex items-center justify-end gap-2">
            <RestoreJobButton jobId={job.id} />
            <DeleteJobButton id={job.id} alwaysVisible />
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotAFitJobsList;
