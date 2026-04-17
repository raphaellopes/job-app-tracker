"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import Modal from "@/components/modals/modal";

import { JobForm } from "@/features/jobs/components/job-form";
import type { Job, JobStatusType } from "@/features/jobs/types";

interface JobModalProps {
  job?: Job;
}

const VALID_STATUSES: JobStatusType[] = [
  "WISHLIST",
  "APPLIED",
  "INTERVIEWING",
  "OFFER",
  "REJECTED",
];

function isValidStatus(status: string | null): status is JobStatusType {
  return status !== null && VALID_STATUSES.includes(status as JobStatusType);
}

const JobModal: React.FC<JobModalProps> = ({ job }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addParam = searchParams.get("add");
  const editParam = searchParams.get("edit");
  const statusParam = searchParams.get("status");
  const isEditing = !!job;
  const isOpen = addParam === "true" || (editParam && job);

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete("add");
    newSearchParams.delete("edit");
    newSearchParams.delete("status");
    const queryString = newSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  if (!isOpen) return null;

  const title = isEditing ? "Edit Job" : "Add New Job";
  const validStatus = isValidStatus(statusParam) ? statusParam : undefined;

  return (
    <Modal title={title} onClose={handleClose}>
      <JobForm job={job} initialStatus={validStatus} />
    </Modal>
  );
};

export default JobModal;
