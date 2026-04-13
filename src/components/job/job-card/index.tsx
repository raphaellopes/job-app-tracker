"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import classNames from "classnames";

import { EditIcon } from "@/components/icons/edit-icon";
import DeleteJobButton from "@/components/job/delete-job-button";
import TagChipList from "@/components/tag/tag-chip-list";

import { Job } from "@/db/schema";

interface JobCardProps {
  job: Job;
}

const JobCard: React.FC<JobCardProps> = ({ job }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: job.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleOpenView = () => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("view", job.id.toString());
    nextSearchParams.delete("add");
    nextSearchParams.delete("edit");
    const queryString = nextSearchParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "border border-gray-100 p-2 rounded-lg shadow-sm bg-white group flex flex-col gap-3",
        {
          "cursor-grabbing": isDragging,
          "cursor-grab": !isDragging,
        },
      )}
      onClick={handleOpenView}
      {...attributes}
      {...listeners}
    >
      <div>
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-800 truncate">{job.companyName}</h3>
          <div
            className="flex items-center gap-2"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <Link
              href={`/board?edit=${job.id}`}
              className="hidden group-hover:block text-gray-400 hover:text-blue-500 transition-colors"
            >
              <EditIcon className="w-4 h-4" />
            </Link>
            <DeleteJobButton id={job.id} />
          </div>
        </div>
        <p className="text-gray-600">{job.jobTitle}</p>
        {job.salaryRange && <p className="text-sm text-gray-500">💰 {job.salaryRange}</p>}
      </div>
      <TagChipList tags={job.tags ?? []} />
      {job.description && (
        <p className="text-sm text-gray-500 italic truncate">{job.description}</p>
      )}
    </div>
  );
};

export default JobCard;
