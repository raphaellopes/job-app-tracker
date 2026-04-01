"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Modal } from "@/components/modals/modal";
import JobView from "@/components/job-view";
import { Job } from "@/db/schema";

interface JobViewModalProps {
  job?: Job;
}

const JobViewModal: React.FC<JobViewModalProps> = ({ job }) => {
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
      <JobView job={job} />
    </Modal>
  );
};

export default JobViewModal;
