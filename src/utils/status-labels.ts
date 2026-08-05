import type { JobStatusType } from "@/db/schema";

const STATUS_LABELS: Partial<Record<JobStatusType, string>> = {
  WISHLIST: "Wishlist",
  APPLIED: "Applied",
  INTERVIEWING: "Interviewing",
  OFFER: "Offer",
  REJECTED: "Rejected",
  NOT_A_FIT: "Not a fit",
};

export function getStatusLabel(status: JobStatusType | string): string {
  const normalized = status.toUpperCase() as JobStatusType;
  return STATUS_LABELS[normalized] ?? normalized;
}
