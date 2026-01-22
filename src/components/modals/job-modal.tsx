'use client';

import { Modal } from '@/components/modals/modal';
import { JobForm } from '@/components/job-form';
import { Job } from '@/db/schema';
import { JobStatusType } from '@/actions/jobs';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface JobModalProps {
  job?: Job;
}

// @TODO: Move this to a constant file
const VALID_STATUSES: JobStatusType[] = ['WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

function isValidStatus(status: string | null): status is JobStatusType {
  return status !== null && VALID_STATUSES.includes(status as JobStatusType);
}

export function JobModal({ job }: JobModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addParam = searchParams.get('add');
  const editParam = searchParams.get('edit');
  const statusParam = searchParams.get('status');
  const isEditing = !!job;
  const isOpen = addParam === 'true' || (editParam && job);

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('add');
    newSearchParams.delete('edit');
    newSearchParams.delete('status');
    const queryString = newSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  if (!isOpen) return null;

  const title = isEditing ? 'Edit Job' : 'Add New Job';
  const validStatus = isValidStatus(statusParam) ? statusParam : undefined;

  return (
    <Modal title={title} onClose={handleClose}>
      <JobForm job={job} initialStatus={validStatus} />
    </Modal>
  );
}
