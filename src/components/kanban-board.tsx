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
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Job } from '@/db/schema';
import { JobStatusType, updateJobStatus } from '@/actions/jobs';
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

    // Check if the job is being moved to a different status
    const job = jobs.find((j) => j.id === jobId);
    if (!job || job.status === newStatus) {
      return;
    }

    try {
      const result = await updateJobStatus(jobId, newStatus);
      
      if (result.error) {
        console.error('Failed to update job status:', result.error);
        // Optionally show an error toast/notification here
        return;
      }

      // Refresh the page to show updated data
      router.refresh();
    } catch (error) {
      console.error('Error updating job status:', error);
      // Optionally show an error toast/notification here
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
      <div className="flex gap-4 overflow-x-auto pb-4">
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

      <DragOverlay>
        {activeJob ? (
          <div className="rotate-3 opacity-90">
            <JobCard job={activeJob} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
