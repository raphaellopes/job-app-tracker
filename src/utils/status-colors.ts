export type JobStatus = 'WISHLIST' | 'APPLIED' | 'INTERVIEWING' | 'OFFER' | 'REJECTED';

export interface StatusColors {
  bg: string;
  text: string;
  border: string;
}

export const STATUS_COLORS: Record<JobStatus, StatusColors> = {
  WISHLIST: {
    bg: 'bg-purple-500',
    text: 'text-purple-500',
    border: 'border-purple-500',
  },
  APPLIED: {
    bg: 'bg-blue-500',
    text: 'text-blue-500',
    border: 'border-blue-500',
  },
  INTERVIEWING: {
    bg: 'bg-amber-500',
    text: 'text-amber-500',
    border: 'border-amber-500',
  },
  OFFER: {
    bg: 'bg-green-500',
    text: 'text-green-500',
    border: 'border-green-500',
  },
  REJECTED: {
    bg: 'bg-red-500',
    text: 'text-red-500',
    border: 'border-red-500',
  },
};

/**
 * Returns the color mapping for a given job status.
 * @param status - The job status string
 * @returns The color classes for the status, or default colors if status is not found
 */
export function getStatusColor(status: string): StatusColors {
  const normalizedStatus = status.toUpperCase() as JobStatus;
  return STATUS_COLORS[normalizedStatus] || {
    bg: 'bg-gray-500',
    text: 'text-gray-500',
    border: 'border-gray-500',
  };
}
