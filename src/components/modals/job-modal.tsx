'use client';

import { Modal } from '@/components/modals/modal';
import { JobForm } from '@/components/job-form';
import { Job } from '@/db/schema';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

interface JobModalProps {
  job?: Job;
}

export function JobModal({ job }: JobModalProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const addParam = searchParams.get('add');
  const editParam = searchParams.get('edit');
  const isEditing = !!job;
  const isOpen = addParam === 'true' || (editParam && job);

  const handleClose = () => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete('add');
    newSearchParams.delete('edit');
    const queryString = newSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  if (!isOpen) return null;

  const title = isEditing ? 'Edit Job' : 'Add New Job';

  return (
    <Modal title={title} onClose={handleClose}>
      <JobForm job={job} />
    </Modal>
  );
}
