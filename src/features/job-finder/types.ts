/** Normalized job row used in the UI (mapped from JSearch wire DTOs in `jsearch/`). */
export type JobFinderUserState = "none" | "saved" | "not_a_fit";

export type JobFinderItem = {
  externalJobId: string;
  title: string;
  employerName: string;
  employerLogo: string | null;
  jobPublisher: string;
  employmentTypes: string[];
  applyLink: string;
  description: string;
  salary?: string;
  isRemote: boolean;
  employerCompanyType?: string;
  naicsName?: string;
  locationTag?: string;
  requiredSkills: string[];
  highlightQualifications: string[];
  highlightResponsibilities: string[];
  userState?: JobFinderUserState;
};

export type JobFinderSearchResponse = {
  items: JobFinderItem[];
  pagination: {
    page: number;
    hasNextPage: boolean;
  };
};

export type JobFinderSearchFilters = {
  query: string;
  remoteOnly: boolean;
  page: number;
};

export type JobFinderSearchResult = JobFinderSearchResponse;
