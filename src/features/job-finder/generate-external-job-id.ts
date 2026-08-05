import { createHash } from "node:crypto";

export type ExternalJobIdInput = {
  title: string;
  companyName: string;
  location: string;
};

export function normalizeExternalJobIdPart(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

/**
 * Deterministic ID from title + company + location (SHA-256 truncated to 32 hex).
 * Does not use provider job_id — JSearch regenerates those between fetches.
 */
export function generateExternalJobId({
  title,
  companyName,
  location,
}: ExternalJobIdInput): string {
  const payload = [
    normalizeExternalJobIdPart(title),
    normalizeExternalJobIdPart(companyName),
    normalizeExternalJobIdPart(location),
  ].join("\0");

  return createHash("sha256").update(payload).digest("hex").slice(0, 32);
}

export function hasUsableExternalJobIdentity(title: string, companyName: string): boolean {
  return (
    normalizeExternalJobIdPart(title).length > 0 ||
    normalizeExternalJobIdPart(companyName).length > 0
  );
}
