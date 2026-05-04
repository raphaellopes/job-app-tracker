import { type JSearchJobDto, type JSearchSearchResponseDto, parseJSearchJobDto } from "./dto";

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

  return {
    externalJobId: job.job_id ?? "",
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
    locationTag: buildLocationTag(job),
    requiredSkills: job.job_required_skills?.filter(Boolean) ?? [],
    highlightQualifications: highlights?.Qualifications?.filter(Boolean) ?? [],
    highlightResponsibilities: highlights?.Responsibilities?.filter(Boolean) ?? [],
  };
}

/**
 * Maps a validated JSearch list response into the app job-finder domain shape.
 * `hasNextPage` matches prior behavior: based on mapped row count before dropping rows without `externalJobId`.
 */
export function mapJSearchResponseToJobFinderSearch(
  dto: JSearchSearchResponseDto,
  page: number,
): JobFinderSearchResponse {
  const rows = dto.data ?? [];
  const mapped = rows.map((raw) => mapJSearchJobDtoToJobFinderItem(parseJSearchJobDto(raw)));
  const hasNextPage = mapped.length >= MAX_ITEMS_PER_PAGE;
  const items = mapped.filter((job) => job.externalJobId);

  return {
    items,
    pagination: {
      page,
      hasNextPage,
    },
  };
}
