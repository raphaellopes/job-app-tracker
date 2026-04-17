import { useState } from "react";
import { toast } from "sonner";

import Button from "@/components/buttons/button";
import Modal from "@/components/modals/modal";

import { saveFoundJob } from "@/actions/jobs";

import { JobFinderItem } from "@/features/job-finder/types";

interface JobFinderJobModalProps {
  job: JobFinderItem | null;
  onClose: () => void;
}

const JobFinderJobModal: React.FC<JobFinderJobModalProps> = ({ job, onClose }) => {
  const [isSaving, setIsSaving] = useState(false);

  if (!job) {
    return null;
  }

  const handleSaveJob = async () => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveFoundJob({
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
      });

      if ("success" in result && result.success) {
        toast.success("Job saved to your wishlist.");
        return;
      }

      if ("error" in result && result.error === "already_saved") {
        toast.info("This job is already saved in your board.");
        return;
      }

      toast.error("Could not save this job.");
    } catch (error) {
      console.error("Failed saving found job:", error);
      toast.error("Something went wrong while saving the job.");
    } finally {
      setIsSaving(false);
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

        <div className="py-4 sticky bottom-0 bg-white border-t border-gray-200">
          <Button type="button" onClick={handleSaveJob} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save to wishlist"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default JobFinderJobModal;
