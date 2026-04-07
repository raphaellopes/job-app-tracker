"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Modal from "@/components/modals/modal";
import JobView from "@/components/job/job-view";
import { Job } from "@/db/schema";
import type { InterviewPrepResult } from "@/actions/gemini";

interface JobViewModalProps {
  job?: Job;
  initialInterviewPrep?: InterviewPrepResult | null;
}

const JobViewModal: React.FC<JobViewModalProps> = ({ job, initialInterviewPrep = null }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const viewParam = searchParams.get("view");
  const isOpen = !!viewParam && !!job;

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("view");
    const queryString = newSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  if (!isOpen || !job) return null;

  return (
    <Modal title={job.jobTitle} description={job.companyName} size="md" onClose={handleClose}>
      <JobView job={job} initialInterviewPrep={initialInterviewPrep} />
    </Modal>
  );
};

export default JobViewModal;
