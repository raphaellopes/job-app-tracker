import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@/components/buttons/button";
import Modal from "@/components/modals/modal";

import { jobFinderKeys } from "@/features/job-finder/query-keys";
import { JobFinderItem, JobFinderUserState } from "@/features/job-finder/types";
import { jobErrorMessage } from "@/features/jobs/errors";
import { dismissFoundJob, restoreFoundJob, saveFoundJob } from "@/features/jobs/server/actions";

interface JobFinderJobModalProps {
  job: JobFinderItem | null;
  onClose: () => void;
  onJobStateChange?: (externalJobId: string, userState: JobFinderUserState) => void;
}

function buildFoundJobPayload(job: JobFinderItem) {
  return {
    externalJobId: job.externalJobId,
    companyName: job.employerName,
    jobTitle: job.title,
    jobPublisher: job.jobPublisher,
    description: job.description,
    salaryRange: job.salary,
    externalApplyLink: job.applyLink || undefined,
    employerLogo: job.employerLogo || undefined,
    employmentTypes: job.employmentTypes,
    isRemote: job.isRemote,
    employerCompanyType: job.employerCompanyType,
    naicsName: job.naicsName,
    locationTag: job.locationTag,
    requiredSkills: job.requiredSkills,
    highlightQualifications: job.highlightQualifications,
    highlightResponsibilities: job.highlightResponsibilities,
  };
}

const JobFinderJobModal: React.FC<JobFinderJobModalProps> = ({
  job,
  onClose,
  onJobStateChange,
}) => {
  const queryClient = useQueryClient();
  const [isSaving, setIsSaving] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  if (!job) {
    return null;
  }

  const userState = job.userState ?? "none";
  const isBusy = isSaving || isDismissing || isRestoring;

  const invalidateJobFinderSearch = async () => {
    await queryClient.invalidateQueries({ queryKey: jobFinderKeys.all });
  };

  const handleSaveJob = async () => {
    if (isBusy) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveFoundJob(buildFoundJobPayload(job));

      if ("success" in result && result.success) {
        toast.success("Job saved to your wishlist.");
        onJobStateChange?.(job.externalJobId, "saved");
        await invalidateJobFinderSearch();
        return;
      }

      if ("error" in result && result.error === "already_saved") {
        toast.info(jobErrorMessage("already_saved"));
        onJobStateChange?.(job.externalJobId, "saved");
        await invalidateJobFinderSearch();
        return;
      }

      if ("error" in result && result.error === "already_not_a_fit") {
        toast.info(jobErrorMessage("already_not_a_fit"));
        onJobStateChange?.(job.externalJobId, "not_a_fit");
        await invalidateJobFinderSearch();
        return;
      }

      if ("error" in result && result.error) {
        toast.error(jobErrorMessage(result.error));
      }
    } catch (error) {
      console.error("Failed saving found job:", error);
      toast.error("Something went wrong while saving the job.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDismissJob = async () => {
    if (isBusy) {
      return;
    }

    setIsDismissing(true);
    try {
      const result = await dismissFoundJob(buildFoundJobPayload(job));

      if ("success" in result && result.success) {
        toast.success("Job marked as not a fit.");
        onJobStateChange?.(job.externalJobId, "not_a_fit");
        await invalidateJobFinderSearch();
        return;
      }

      if ("error" in result && result.error) {
        toast.error(jobErrorMessage(result.error));
      }
    } catch (error) {
      console.error("Failed marking job as not a fit:", error);
      toast.error("Something went wrong while updating the job.");
    } finally {
      setIsDismissing(false);
    }
  };

  const handleRestoreJob = async () => {
    if (isBusy) {
      return;
    }

    setIsRestoring(true);
    try {
      const result = await restoreFoundJob(job.externalJobId);

      if ("success" in result && result.success) {
        toast.success("Job restored to your wishlist.");
        onJobStateChange?.(job.externalJobId, "saved");
        await invalidateJobFinderSearch();
        return;
      }

      if ("error" in result && result.error) {
        toast.error(jobErrorMessage(result.error));
      }
    } catch (error) {
      console.error("Failed restoring job:", error);
      toast.error("Something went wrong while restoring the job.");
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <Modal title={job.title} description={job.employerName} size="md" onClose={onClose}>
      <div className="space-y-3 text-sm text-gray-700 border-t border-gray-200 pt-4">
        <p>
          <span className="font-semibold">Employer:</span> {job.employerName}
        </p>
        <p>
          <span className="font-semibold">Job publisher:</span> {job.jobPublisher}
        </p>
        <p>
          <span className="font-semibold">Employment types:</span>{" "}
          {job.employmentTypes.length > 0 ? job.employmentTypes.join(", ") : "Not provided"}
        </p>
        <p>
          <span className="font-semibold">Salary:</span> {job.salary ?? "Not provided"}
        </p>
        <p>
          <span className="font-semibold">Apply link:</span>{" "}
          {job.applyLink ? (
            <a
              href={job.applyLink}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline"
            >
              Open job post
            </a>
          ) : (
            "Not provided"
          )}
        </p>
        <div>
          <p className="font-semibold">Description</p>
          <p className="mt-1 whitespace-pre-wrap">
            {job.description || "No description available."}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 py-4 sticky bottom-0 bg-white border-t border-gray-200">
          {userState === "not_a_fit" ? (
            <>
              <Button type="button" onClick={handleRestoreJob} disabled={isBusy}>
                {isRestoring ? "Restoring..." : "Restore to wishlist"}
              </Button>
              <Button type="button" variant="secondary" disabled>
                Marked as not a fit
              </Button>
            </>
          ) : (
            <>
              <Button
                type="button"
                onClick={handleSaveJob}
                disabled={isBusy || userState === "saved"}
              >
                {isSaving
                  ? "Saving..."
                  : userState === "saved"
                    ? "Already in wishlist"
                    : "Save to wishlist"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={handleDismissJob}
                disabled={isBusy}
              >
                {isDismissing ? "Updating..." : "Mark as not a fit"}
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default JobFinderJobModal;
