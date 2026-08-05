import { type JSearchJobDto, type JSearchSearchResponseDto, parseJSearchJobDto } from "./dto";

import {
  generateExternalJobId,
  hasUsableExternalJobIdentity,
} from "@/features/job-finder/generate-external-job-id";
import type { JobFinderItem, JobFinderSearchResponse } from "@/features/job-finder/types";

const MAX_ITEMS_PER_PAGE = 10;
const DEFAULT_CURRENCY = "USD";

function formatSalary(job: JSearchJobDto): string | undefined {
  const min = job?.job_min_salary;
  const max = job?.job_max_salary;
  if (typeof min !== "number" && typeof max !== "number") {
    return undefined;
  }

  const currency = job?.job_salary_currency ?? DEFAULT_CURRENCY;
  const period = job?.job_salary_period ? ` / ${job.job_salary_period}` : "";
  if (typeof min === "number" && typeof max === "number") {
    return `${currency} ${min.toLocaleString()} - ${max.toLocaleString()}${period}`;
  }
  const value = (min ?? max) as number;
  return `${currency} ${value.toLocaleString()}${period}`;
}

function buildLocationTag(job: JSearchJobDto): string | undefined {
  const parts = [job.job_city, job.job_state, job.job_country]
    .map((part) => (typeof part === "string" ? part.trim() : ""))
    .filter(Boolean);

  if (parts.length === 0) {
    return undefined;
  }

  return parts.join(", ");
}

export function mapJSearchJobDtoToJobFinderItem(job: JSearchJobDto): JobFinderItem {
  const employmentTypes = job.job_employment_types?.filter(Boolean) ?? [];
  const primaryEmploymentType = job.job_employment_type?.trim();
  if (primaryEmploymentType && !employmentTypes.includes(primaryEmploymentType)) {
    employmentTypes.unshift(primaryEmploymentType);
  }

  const highlights = job.job_highlights;
  const rawTitle = job.job_title ?? "";
  const rawCompanyName = job.employer_name ?? "";
  const locationTag = buildLocationTag(job);

  return {
    externalJobId: generateExternalJobId({
      title: rawTitle,
      companyName: rawCompanyName,
      location: locationTag ?? "",
    }),
    title: job.job_title ?? "Untitled role",
    employerName: job.employer_name ?? "Unknown company",
    employerLogo: job.employer_logo ?? null,
    jobPublisher: job.job_publisher ?? "Unknown publisher",
    employmentTypes,
    applyLink: job.job_apply_link ?? "",
    description: job.job_description ?? "",
    salary: formatSalary(job),
    isRemote: job.job_is_remote ?? false,
    employerCompanyType: job.employer_company_type ?? undefined,
    naicsName: job.job_naics_name ?? undefined,
    locationTag,
    requiredSkills: job.job_required_skills?.filter(Boolean) ?? [],
    highlightQualifications: highlights?.Qualifications?.filter(Boolean) ?? [],
    highlightResponsibilities: highlights?.Responsibilities?.filter(Boolean) ?? [],
  };
}

function hasUsableIdentityFromDto(job: JSearchJobDto): boolean {
  return hasUsableExternalJobIdentity(job.job_title ?? "", job.employer_name ?? "");
}

/**
 * Maps a validated JSearch list response into the app job-finder domain shape.
 * `hasNextPage` is based on mapped row count before dropping rows without usable identity.
 */
export function mapJSearchResponseToJobFinderSearch(
  dto: JSearchSearchResponseDto,
  page: number,
): JobFinderSearchResponse {
  const rows = dto.data ?? [];
  const parsed = rows.map((raw) => parseJSearchJobDto(raw));
  const hasNextPage = parsed.length >= MAX_ITEMS_PER_PAGE;
  const items = parsed
    .filter((job) => hasUsableIdentityFromDto(job))
    .map((job) => mapJSearchJobDtoToJobFinderItem(job));

  return {
    items,
    pagination: {
      page,
      hasNextPage,
    },
  };
}
