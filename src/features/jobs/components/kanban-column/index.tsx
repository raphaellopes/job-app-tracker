"use client";

import { useDroppable } from "@dnd-kit/core";

import { AddJobButton } from "@/features/jobs/components/add-job-button";
import JobCard from "@/features/jobs/components/job-card";
import type { Job, JobStatusType } from "@/features/jobs/types";
import { formatStatusName } from "@/utils/format-status-name";

interface KanbanColumnProps {
  status: JobStatusType;
  jobs: Job[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ status, jobs }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  });

  const formattedStatus = formatStatusName(status);
  const jobCount = jobs.length;
  const isEmpty = jobs.length === 0;

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col min-w-[280px] w-[280px] max-w-[280px] bg-gray-50 rounded-lg border-2 transition-all duration-200 ${
        isOver
          ? "border-blue-500 bg-blue-50 shadow-lg scale-[1.02]"
          : "border-gray-200 hover:border-gray-300"
      }`}
      style={{
        maxHeight: "calc(100vh - 240px)",
      }}
    >
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800">{formattedStatus}</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
            {jobCount}
          </span>
        </div>
        <AddJobButton status={status} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <div className="text-sm font-medium mb-1">No jobs yet</div>
            <div className="text-xs text-gray-400 text-center px-2">
              Drop a job here or click + to add
            </div>
          </div>
        ) : (
          jobs.map((job) => <JobCard key={job.id} job={job} />)
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
