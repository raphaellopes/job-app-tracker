"use client";

import { deleteJob } from "@/actions/jobs";
import { TrashIcon } from "@/components/icons/trash-icon";

interface DeleteJobButtonProps {
  id: number;
}

export function DeleteJobButton({ id }: DeleteJobButtonProps) {
  return (
    <form
      action={deleteJob}
      onSubmit={(e) => {
        if (!confirm("Are you sure you want to delete this job?")) {
          e.preventDefault();
        }
      }}
      className="hidden group-hover:flex"
    >
      <input type="hidden" name="id" value={id} />
      <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
        <TrashIcon className="w-4 h-4" />
      </button>
    </form>
  );
}
