import { z } from "zod";

const MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES = 10;
const MAX_SAVE_FOUND_JOB_LIST_ITEMS = 20;
const MAX_SAVED_TAGS = 10;
const MAX_HIGHLIGHT_TAG_LENGTH = 60;

export const JobStatus = z.enum(["WISHLIST", "APPLIED", "INTERVIEWING", "OFFER", "REJECTED"]);
export type JobStatusType = z.infer<typeof JobStatus>;

export const createJobSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Position is required"),
  status: JobStatus,
  salaryRange: z.string().optional(),
  description: z.string().optional(),
  tags: z.string().optional(),
});

export const saveFoundJobSchema = z.object({
  jobTitle: z.string().min(1, "Job title is required"),
  companyName: z.string().min(1, "Employer name is required"),
  description: z.string().optional(),
  salaryRange: z.string().optional(),
  externalJobId: z.string().min(1),
  externalApplyLink: z.string().url().optional(),
  employerLogo: z.string().url().optional(),
  jobPublisher: z.string().min(1).optional(),
  employmentTypes: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES).optional(),
  isRemote: z.boolean().optional(),
  employerCompanyType: z.string().min(1).optional(),
  naicsName: z.string().min(1).optional(),
  locationTag: z.string().min(1).optional(),
  requiredSkills: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_LIST_ITEMS).optional(),
  highlightQualifications: z.array(z.string().min(1)).max(MAX_SAVE_FOUND_JOB_LIST_ITEMS).optional(),
  highlightResponsibilities: z
    .array(z.string().min(1))
    .max(MAX_SAVE_FOUND_JOB_LIST_ITEMS)
    .optional(),
});

type SaveFoundJobPayload = z.infer<typeof saveFoundJobSchema>;

export function normalizeSaveFoundJobPayload(payload: SaveFoundJobPayload): SaveFoundJobPayload {
  return {
    ...payload,
    employmentTypes: payload.employmentTypes?.slice(0, MAX_SAVE_FOUND_JOB_EMPLOYMENT_TYPES),
    requiredSkills: payload.requiredSkills?.slice(0, MAX_SAVE_FOUND_JOB_LIST_ITEMS),
    highlightQualifications: payload.highlightQualifications?.slice(
      0,
      MAX_SAVE_FOUND_JOB_LIST_ITEMS,
    ),
    highlightResponsibilities: payload.highlightResponsibilities?.slice(
      0,
      MAX_SAVE_FOUND_JOB_LIST_ITEMS,
    ),
  };
}

export function parseTagsInput(tags?: string): string[] {
  if (!tags) return [];
  return [
    ...new Set(
      tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

function normalizeTag(tag: string): string {
  return tag.trim().replace(/\s+/g, " ");
}

function appendTag(tags: string[], seen: Set<string>, value?: string) {
  if (!value || tags.length >= MAX_SAVED_TAGS) {
    return;
  }

  const normalized = normalizeTag(value);
  if (!normalized) {
    return;
  }

  const key = normalized.toLowerCase();
  if (seen.has(key)) {
    return;
  }

  tags.push(normalized);
  seen.add(key);
}

export function buildFoundJobTags(payload: z.infer<typeof saveFoundJobSchema>): string[] {
  const tags: string[] = [];
  const seen = new Set<string>();

  for (const employmentType of payload.employmentTypes ?? []) {
    appendTag(tags, seen, employmentType);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  if (payload.isRemote) {
    appendTag(tags, seen, "Remote");
  }
  appendTag(tags, seen, payload.jobPublisher);
  appendTag(tags, seen, payload.employerCompanyType);
  appendTag(tags, seen, payload.naicsName);
  appendTag(tags, seen, payload.locationTag);

  for (const skill of payload.requiredSkills ?? []) {
    appendTag(tags, seen, skill);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  const highlights = [
    ...(payload.highlightQualifications ?? []),
    ...(payload.highlightResponsibilities ?? []),
  ];
  for (const highlight of highlights) {
    const normalizedHighlight = normalizeTag(highlight);
    if (!normalizedHighlight || normalizedHighlight.length > MAX_HIGHLIGHT_TAG_LENGTH) {
      continue;
    }
    appendTag(tags, seen, normalizedHighlight);
    if (tags.length >= MAX_SAVED_TAGS) {
      return tags;
    }
  }

  return tags;
}
