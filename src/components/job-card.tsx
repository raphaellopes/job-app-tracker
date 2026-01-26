'use client';

import Link from 'next/link';
import { Job } from '@/db/schema';
import { DeleteJobButton } from '@/components/delete-job-button';
import { EditIcon } from '@/components/icons/edit-icon';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import classNames from 'classnames';

interface JobCardProps {
  job: Job;
}

export function JobCard({ job }: JobCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames('border p-2 rounded-lg shadow-sm bg-white group', {
        'cursor-grabbing': isDragging,
        'cursor-grab': !isDragging,
      })}
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-lg text-gray-800 truncate">{job.companyName}</h3>
        <div 
          className="flex items-center gap-2" 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Link href={`/board?edit=${job.id}`} className="hidden group-hover:block text-gray-400 hover:text-blue-500 transition-colors">
            <EditIcon className="w-4 h-4" />
          </Link>
          <DeleteJobButton id={job.id} />
        </div>
      </div>
      <p className="text-gray-600">{job.jobTitle}</p>
      {job.salaryRange && (
        <p className="text-sm text-gray-500">💰 {job.salaryRange}</p>
      )}
      {job.notes && (
        <p className="text-sm text-gray-500 mt-2 italic truncate">
          {job.notes}
        </p>
      )}
    </div>
  );
}
