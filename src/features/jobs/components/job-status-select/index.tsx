"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import classNames from "classnames";
import { toast } from "sonner";

import { JOB_STATUSES } from "@/db/schema";

import { useUpdateJobStatus } from "@/features/jobs/mutations";
import type { JobsBoardFilters, JobStatusType } from "@/features/jobs/types";
import { formatStatusName } from "@/utils/format-status-name";
import { getStatusColor } from "@/utils/status-colors";

interface JobStatusSelectProps {
  jobId: number;
  status: JobStatusType;
  filters?: JobsBoardFilters;
}

const JobStatusSelect: React.FC<JobStatusSelectProps> = ({ jobId, status, filters = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatusType>(status);
  const containerRef = useRef<HTMLDivElement>(null);
  const updateStatusMutation = useUpdateJobStatus(filters);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const selectedStatusColor = useMemo(() => getStatusColor(selectedStatus), [selectedStatus]);

  const handleStatusChange = async (nextStatus: JobStatusType) => {
    if (nextStatus === selectedStatus || updateStatusMutation.isPending) {
      setIsOpen(false);
      return;
    }

    const previousStatus = selectedStatus;
    setSelectedStatus(nextStatus);
    setIsOpen(false);

    try {
      const result = await updateStatusMutation.mutateAsync({ jobId, status: nextStatus });
      if ("error" in result) {
        setSelectedStatus(previousStatus);
        toast.error("Could not update the job status.");
        return;
      }
      toast.success("Status updated successfully.");
    } catch (error) {
      console.error("Error updating job status:", error);
      setSelectedStatus(previousStatus);
      toast.error("Something went wrong while updating status.");
    }
  };

  return (
    <div className="relative inline-flex" ref={containerRef}>
      <button
        type="button"
        className={classNames(
          "inline-flex min-w-40 items-center justify-between rounded-md border px-3 py-1.5 text-sm font-medium transition-colors bg-opacity-10 disabled:cursor-not-allowed",
          selectedStatusColor.border,
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        disabled={updateStatusMutation.isPending}
      >
        <span className="flex items-center gap-2">
          <span className={classNames("w-2 h-2 block rounded-full", selectedStatusColor.bg)}></span>
          {formatStatusName(selectedStatus)}
        </span>
        <span aria-hidden="true" className={classNames("ml-3 text-xs", selectedStatusColor.text)}>
          {isOpen ? "▲" : "▼"}
        </span>
      </button>

      {isOpen ? (
        <ul
          role="listbox"
          aria-label="Select job status"
          className="absolute left-0 top-full z-10 mt-1 w-52 rounded-md border border-gray-200 bg-white p-1 shadow-lg"
        >
          {JOB_STATUSES.map((statusOption) => {
            const statusColor = getStatusColor(statusOption);
            const isSelected = selectedStatus === statusOption;
            return (
              <li key={statusOption} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  className={classNames(
                    "flex w-full items-center rounded px-2 py-1.5 text-left text-sm bg-opacity-10 hover:bg-gray-100",
                  )}
                  onClick={() => handleStatusChange(statusOption)}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={classNames("w-2 h-2 block rounded-full", statusColor.bg)}
                    ></span>
                    {formatStatusName(statusOption)}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};

export default JobStatusSelect;
