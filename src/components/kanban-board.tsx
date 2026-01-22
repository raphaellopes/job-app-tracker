'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Job } from '@/db/schema';
import { JobStatusType, updateJobStatus, updateJobPositions } from '@/actions/jobs';
import { KanbanColumn } from '@/components/kanban-column';
import { JobCard } from '@/components/job-card';

interface KanbanBoardProps {
  jobs: Job[];
}

const STATUSES: JobStatusType[] = ['WISHLIST', 'APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED'];

export function KanbanBoard({ jobs }: KanbanBoardProps) {
  const router = useRouter();
  const [activeJob, setActiveJob] = useState<Job | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Group jobs by status
  const jobsByStatus = STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter((job) => job.status === status);
    return acc;
  }, {} as Record<JobStatusType, Job[]>);

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
    if (STATUSES.includes(over.id as JobStatusType)) {
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
      const columnJobs = jobsByStatus[newStatus];
      
      // Find the current index of the dragged job
      const oldIndex = columnJobs.findIndex((j) => j.id === jobId);
      
      // Find the new index based on where it was dropped
      let newIndex: number;
      if (STATUSES.includes(over.id as JobStatusType)) {
        // Dropped on the column itself - move to the end
        newIndex = columnJobs.length - 1;
      } else {
        // Dropped on another job - find that job's index
        const targetIndex = columnJobs.findIndex((j) => j.id === over.id);
        if (targetIndex !== -1) {
          // Insert at the target position (before the target job)
          newIndex = targetIndex;
        } else {
          newIndex = oldIndex;
        }
      }

      // Use arrayMove to calculate the new order
      const reorderedJobs = arrayMove(columnJobs, oldIndex, newIndex);
      const newJobIds = reorderedJobs.map((job) => job.id);

      try {
        const result = await updateJobPositions(newJobIds, newStatus);
        
        if ('error' in result) {
          console.error('Failed to update job positions:', result.error);
          return;
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        console.error('Error updating job positions:', error);
      }
    } else {
      // Different column: update status (which will also set position to bottom)
      try {
        const result = await updateJobStatus(jobId, newStatus);
        
        if ('error' in result) {
          console.error('Failed to update job status:', result.error);
          return;
        }

        // Refresh the page to show updated data
        router.refresh();
      } catch (error) {
        console.error('Error updating job status:', error);
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
          {STATUSES.map((status) => {
            const columnJobs = jobsByStatus[status];
            return (
              <SortableContext
                key={status}
                items={columnJobs.map((job) => job.id)}
                strategy={verticalListSortingStrategy}
              >
                <KanbanColumn
                  status={status}
                  jobs={columnJobs}
                />
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
