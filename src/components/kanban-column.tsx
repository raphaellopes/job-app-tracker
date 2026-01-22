import { Job } from '@/db/schema';
import { JobStatusType } from '@/actions/jobs';
import { JobCard } from '@/components/job-card';
import { PlusIcon } from '@/components/icons/plus-icon';

interface KanbanColumnProps {
  status: JobStatusType;
  jobs: Job[];
  onAddClick?: () => void;
}

function formatStatusName(status: JobStatusType): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function KanbanColumn({ status, jobs, onAddClick }: KanbanColumnProps) {
  const formattedStatus = formatStatusName(status);
  const jobCount = jobs.length;

  return (
    <div className="flex flex-col h-full w-80 bg-gray-50 rounded-lg border border-gray-200">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">{formattedStatus}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {jobCount}
          </span>
        </div>
        {onAddClick && (
          <button
            onClick={onAddClick}
            className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-800 transition-colors"
            aria-label={`Add job to ${formattedStatus}`}
          >
            <PlusIcon size="base" />
          </button>
        )}
      </div>

      {/* Scrollable Job Cards Container */}
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
