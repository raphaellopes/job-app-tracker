"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { Job, JOB_STATUSES } from "@/db/schema";
import { JobStatusType, updateJobStatus, updateJobPositions } from "@/actions/jobs";
import { KanbanColumn } from "@/components/kanban/kanban-column";
import { JobCard } from "@/components/job/job-card";

interface KanbanBoardProps {
  jobs: Job[];
}

export function KanbanBoard({ jobs }: KanbanBoardProps) {
  const router = useRouter();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

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
    const { active } = event;
    const job = jobs.find((j) => j.id === active.id);
    if (job) {
      setActiveJob(job);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveJob(null);

    if (!over) {
      return;
    }

    const jobId = active.id as number;
    const draggedJob = jobs.find((j) => j.id === jobId);

    if (!draggedJob) {
      return;
    }

    let newStatus: JobStatusType | null = null;

    // Check if dropped on a column (status) or on another job
    if (JOB_STATUSES.includes(over.id as JobStatusType)) {
      // Dropped directly on a column
      newStatus = over.id as JobStatusType;
    } else {
      // Dropped on another job - find that job's status
      const targetJob = jobs.find((j) => j.id === over.id);
      if (targetJob) {
        newStatus = targetJob.status;
      }
    }

    if (!newStatus) {
      return;
    }

    // Check if the job is being moved within the same column (same status)
    if (draggedJob.status === newStatus) {
      // Same column: reorder jobs within the column
      // Get the current array of jobs for that status
      const columnJobs = jobsByStatus[newStatus];

      // Find the index of the dragged job (active.id)
      const oldIndex = columnJobs.findIndex((j) => j.id === jobId);

      if (oldIndex === -1) {
        console.error("Dragged job not found in column");
        return;
      }

      // Find the target position (over.id or over position)
      let newIndex: number;

      if (JOB_STATUSES.includes(over.id as JobStatusType)) {
        // Dropped directly on the column (droppable area) - move to the end
        // Edge case: if already at the end, no change needed
        newIndex = columnJobs.length - 1;
      } else {
        // Dropped on another job - find that job's index in the column
        const targetIndex = columnJobs.findIndex((j) => j.id === over.id);

        if (targetIndex === -1) {
          // Target job not found in this column (shouldn't happen, but handle gracefully)
          console.error("Target job not found in column");
          return;
        }

        // Determine insertion position based on drag direction
        // If dragging down (oldIndex < targetIndex), insert before target (targetIndex)
        // If dragging up (oldIndex > targetIndex), insert before target (targetIndex)
        // arrayMove handles the index adjustment automatically
        newIndex = targetIndex;
      }

      // Edge case: if oldIndex and newIndex are the same, no reordering needed
      if (oldIndex === newIndex) {
        return;
      }

      // Use arrayMove to reorder the array: arrayMove(currentJobs, oldIndex, newIndex)
      const reorderedJobs = arrayMove(columnJobs, oldIndex, newIndex);

      // Extract the job IDs from the reordered array
      const newJobIds = reorderedJobs.map((job) => job.id);

      try {
        // Call updateJobPositions with the status and the array of job IDs
        const result = await updateJobPositions(newJobIds, newStatus);

        if ("error" in result) {
          console.error("Failed to update job positions:", result.error);
          return;
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        console.error("Error updating job positions:", error);
      }
    } else {
      // Different column: update status (which will also set position to bottom)
      try {
        const result = await updateJobStatus(jobId, newStatus);

        if ("error" in result) {
          console.error("Failed to update job status:", result.error);
          return;
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        console.error("Error updating job status:", error);
      }
    }
  };

  const handleDragCancel = () => {
    setActiveJob(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
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
}
