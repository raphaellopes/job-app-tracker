"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Modal from "@/components/modals/modal";

import JobView from "@/features/jobs/components/job-view";
import type { Job, JobsBoardFilters } from "@/features/jobs/types";

interface JobViewModalProps {
  job?: Job;
  filters?: JobsBoardFilters;
}

const JobViewModal: React.FC<JobViewModalProps> = ({ job, filters = {} }) => {
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
      <JobView job={job} filters={filters} />
    </Modal>
  );
};

export default JobViewModal;
