import { JobStatusType } from "@/db/schema";

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export const STATUS_COLORS: Record<JobStatusType, StatusColors> = {
  WISHLIST: {
    bg: "bg-purple-500",
    text: "text-purple-200",
    border: "border-purple-900",
  },
  APPLIED: {
    bg: "bg-blue-500",
    text: "text-blue-200",
    border: "border-blue-900",
  },
  INTERVIEWING: {
    bg: "bg-amber-500",
    text: "text-amber-200",
    border: "border-amber-900",
  },
  OFFER: {
    bg: "bg-green-500",
    text: "text-green-200",
    border: "border-green-900",
  },
  REJECTED: {
    bg: "bg-red-500",
    text: "text-red-200",
    border: "border-red-900",
  },
};

/**
 * Returns the color mapping for a given job status.
 * @param status - The job status string
 * @returns The color classes for the status, or default colors if status is not found
 */
export function getStatusColor(status: string): StatusColors {
  const normalizedStatus = status.toUpperCase() as JobStatusType;
  return (
    STATUS_COLORS[normalizedStatus] || {
      bg: "bg-gray-500",
      text: "text-gray-500",
      border: "border-gray-500",
    }
  );
}
