"use client";

import { useState } from "react";
import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { JOB_STATUSES } from "@/db/schema";

import JobCard from "@/features/jobs/components/job-card";
import KanbanColumn from "@/features/jobs/components/kanban-column";
import { useUpdateJobPositions, useUpdateJobStatus } from "@/features/jobs/mutations";
import type { Job, JobsBoardFilters, JobStatusType } from "@/features/jobs/types";

interface KanbanBoardProps {
  jobs: Job[];
  filters?: JobsBoardFilters;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ jobs, filters = {} }) => {
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const updateStatusMutation = useUpdateJobStatus(filters);
  const updatePositionsMutation = useUpdateJobPositions(filters);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  const jobsByStatus = JOB_STATUSES.reduce(
    (acc, status) => {
      acc[status] = jobs.filter((job) => job.status === status);
      return acc;
    },
    {} as Record<JobStatusType, Job[]>,
  );

  const handleDragStart = (event: DragStartEvent) => {
    const job = jobs.find((j) => j.id === event.active.id);
    if (job) setActiveJob(job);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);
    if (!over) return;

    const jobId = active.id as number;
    const draggedJob = jobs.find((j) => j.id === jobId);
    if (!draggedJob) return;

    let newStatus: JobStatusType | null = null;
    if (JOB_STATUSES.includes(over.id as JobStatusType)) {
      newStatus = over.id as JobStatusType;
    } else {
      const targetJob = jobs.find((j) => j.id === over.id);
      if (targetJob) newStatus = targetJob.status;
    }
    if (!newStatus) return;

    if (draggedJob.status === newStatus) {
      const columnJobs = jobsByStatus[newStatus];
      const oldIndex = columnJobs.findIndex((j) => j.id === jobId);
      if (oldIndex === -1) return;

      const newIndex = JOB_STATUSES.includes(over.id as JobStatusType)
        ? columnJobs.length - 1
        : columnJobs.findIndex((j) => j.id === over.id);

      if (newIndex === -1 || oldIndex === newIndex) return;

      const newJobIds = arrayMove(columnJobs, oldIndex, newIndex).map((job) => job.id);
      const result = await updatePositionsMutation.mutateAsync({
        jobIds: newJobIds,
        status: newStatus,
      });
      if ("error" in result) {
        console.error("Failed to update job positions:", result.error);
      }
      return;
    }

    const result = await updateStatusMutation.mutateAsync({ jobId, status: newStatus });
    if ("error" in result) {
      console.error("Failed to update job status:", result.error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveJob(null)}
    >
      <div className="w-full overflow-x-auto pb-4 -mx-2 px-2 pt-2 scroll-smooth">
        <div className="flex gap-4 min-w-max">
          {JOB_STATUSES.map((status) => {
            const columnJobs = jobsByStatus[status];
            return (
              <SortableContext
                key={status}
                items={columnJobs.map((job) => job.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn status={status} jobs={columnJobs} />
              </SortableContext>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activeJob ? (
          <div className="rotate-3 opacity-90 shadow-lg transition-transform">
            <JobCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default KanbanBoard;
