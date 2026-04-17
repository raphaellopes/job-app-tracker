"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import JobFinderJobModal from "@/components/job-finder/job-finder-job-modal";
import JobFinderPaginationControls from "@/components/job-finder/job-finder-pagination-controls";
import JobFinderResultsTable from "@/components/job-finder/job-finder-results-table";
import JobFinderSearchForm from "@/components/job-finder/job-finder-search-form";
import { JobFinderItem } from "@/components/job-finder/types";
import { useJobFinderSearch } from "@/features/jobs/queries";

const JobFinderClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedJob, setSelectedJob] = useState<JobFinderItem | null>(null);

  const query = searchParams.get("q") ?? "";
  const [draftQuery, setDraftQuery] = useState(query);
  const remoteOnly = searchParams.get("remoteOnly") === "true";
  const page = Number(searchParams.get("page") ?? "1");

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  const filters = {
    query,
    remoteOnly,
    page: Number.isNaN(page) || page < 1 ? 1 : page,
  } as const;

  const canSearch = filters.query.trim().length > 0;
  const canSubmitSearch = draftQuery.trim().length > 0;

  const { data, isLoading, isError } = useJobFinderSearch(filters, canSearch);

  const results = data?.items ?? [];
  const hasResults = results.length > 0;
  const hasNextPage = data?.pagination.hasNextPage ?? false;

  const paginationLabel = useMemo(() => `Page ${filters.page}`, [filters.page]);

  const updateSearchParams = (next: { query?: string; remoteOnly?: boolean; page?: number }) => {
    const newParams = new URLSearchParams(searchParams.toString());

    if (next.query !== undefined) {
      if (next.query.length > 0) {
        newParams.set("q", next.query);
      } else {
        newParams.delete("q");
      }
    }

    if (next.remoteOnly !== undefined) {
      if (next.remoteOnly) {
        newParams.set("remoteOnly", "true");
      } else {
        newParams.delete("remoteOnly");
      }
    }

    if (next.page !== undefined) {
      if (next.page > 1) {
        newParams.set("page", String(next.page));
      } else {
        newParams.delete("page");
      }
    }

    const queryString = newParams.toString();
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(href);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmitSearch) {
      return;
    }

    updateSearchParams({ query: draftQuery, page: 1 });
  };

  return (
    <div className="space-y-6">
      <JobFinderSearchForm
        query={draftQuery}
        remoteOnly={filters.remoteOnly}
        isLoading={isLoading}
        canSearch={canSubmitSearch}
        errorMessage={
          !canSubmitSearch && draftQuery
            ? "Enter a search query to find jobs."
            : isError
              ? "Could not load jobs right now. Please try again."
              : null
        }
        onQueryChange={setDraftQuery}
        onRemoteOnlyChange={(nextRemoteOnly) =>
          updateSearchParams({ remoteOnly: nextRemoteOnly, page: 1 })
        }
        onSubmit={handleSubmit}
      />

      <JobFinderResultsTable
        results={results}
        isLoading={isLoading}
        hasResults={hasResults}
        onSelectJob={setSelectedJob}
      />

      <JobFinderPaginationControls
        page={filters.page}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        paginationLabel={paginationLabel}
        onPrevious={() => updateSearchParams({ page: Math.max(1, filters.page - 1) })}
        onNext={() => updateSearchParams({ page: filters.page + 1 })}
      />

      <JobFinderJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobFinderClient;
