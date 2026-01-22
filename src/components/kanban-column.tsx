'use client';

import { useDroppable } from '@dnd-kit/core';
import { Job } from '@/db/schema';
import { JobStatusType } from '@/actions/jobs';
import { JobCard } from '@/components/job-card';
import { AddJobButton } from '@/components/add-job-button';

interface KanbanColumnProps {
  status: JobStatusType;
  jobs: Job[];
}

function formatStatusName(status: JobStatusType): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function KanbanColumn({ status, jobs }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const formattedStatus = formatStatusName(status);
  const jobCount = jobs.length;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col h-full w-80 bg-gray-50 rounded-lg border-2 transition-colors ${
        isOver ? 'border-blue-400 bg-blue-50' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">{formattedStatus}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {jobCount}
          </span>
        </div>
        <AddJobButton status={status} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {jobs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No jobs in this column
          </div>
        ) : (
          jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        )}
      </div>
    </div>
  );
}
