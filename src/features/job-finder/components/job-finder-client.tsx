"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import JobFinderJobModal from "@/features/job-finder/components/job-finder-job-modal";
import JobFinderPaginationControls from "@/features/job-finder/components/job-finder-pagination-controls";
import JobFinderResultsTable from "@/features/job-finder/components/job-finder-results-table";
import JobFinderSearchForm from "@/features/job-finder/components/job-finder-search-form";
import { useJobFinderSearch } from "@/features/job-finder/queries";
import { JobFinderItem } from "@/features/job-finder/types";

const JobFinderClient: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [selectedJob, setSelectedJob] = useState<JobFinderItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadedPages, setLoadedPages] = useState<number[]>([]);
  const [appendedResults, setAppendedResults] = useState<JobFinderItem[]>([]);

  const query = searchParams.get("q") ?? "";
  const [draftQuery, setDraftQuery] = useState(query);
  const remoteOnly = searchParams.get("remoteOnly") === "true";

  const cleanUpResults = () => {
    setCurrentPage(1);
    setLoadedPages([]);
    setAppendedResults([]);
  };

  useEffect(() => {
    setDraftQuery(query);
  }, [query]);

  useEffect(() => {
    cleanUpResults();
  }, [query, remoteOnly]);

  const filters = {
    query,
    remoteOnly,
    page: currentPage,
  } as const;

  const canSearch = filters.query.trim().length > 0;
  const canSubmitSearch = draftQuery.trim().length > 0;

  const { data, isLoading, isError } = useJobFinderSearch(filters, canSearch);

  useEffect(() => {
    if (!data || loadedPages.includes(currentPage)) {
      return;
    }

    setLoadedPages((previousPages) => [...previousPages, currentPage]);
    setAppendedResults((previousResults) => {
      if (currentPage === 1) {
        return data.items;
      }

      const seenIds = new Set(previousResults.map((job) => job.externalJobId));
      const nextJobs = data.items.filter((job) => !seenIds.has(job.externalJobId));
      return [...previousResults, ...nextJobs];
    });
  }, [currentPage, data, loadedPages]);

  const hasSearched = canSearch;
  const isSearchingFirstPage = isLoading && currentPage === 1;
  const isLoadingMore = isLoading && currentPage > 1;
  const hasResults = appendedResults.length > 0;
  const hasNextPage = data?.pagination.hasNextPage ?? false;
  const canRenderViewMore = hasNextPage || isLoadingMore;
  const showIdleState = !hasSearched;
  const showEmptyResultsState = hasSearched && !isSearchingFirstPage && !hasResults;

  const jobFinderErrorMessage = useMemo(() => {
    if (!canSubmitSearch && draftQuery) {
      return "Enter a search query to find jobs.";
    }
    if (isError) {
      return "Could not load jobs right now. Please try again.";
    }
    return null;
  }, [canSubmitSearch, draftQuery, isError]);

  const updateSearchParams = (next: { query?: string; remoteOnly?: boolean }) => {
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

    const queryString = newParams.toString();
    const href = queryString ? `${pathname}?${queryString}` : pathname;
    router.push(href);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmitSearch) {
      return;
    }

    cleanUpResults();
    updateSearchParams({ query: draftQuery });
  };

  return (
    <div className="space-y-6">
      <JobFinderSearchForm
        query={draftQuery}
        remoteOnly={filters.remoteOnly}
        isSearching={isSearchingFirstPage}
        canSearch={canSubmitSearch}
        errorMessage={jobFinderErrorMessage}
        onQueryChange={setDraftQuery}
        onRemoteOnlyChange={(nextRemoteOnly) => updateSearchParams({ remoteOnly: nextRemoteOnly })}
        onSubmit={handleSubmit}
      />

      {showIdleState && (
        <div className="rounded-lg border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
          Start by entering a search term to find open roles.
        </div>
      )}

      {showEmptyResultsState && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 text-sm text-gray-600">
          No jobs found for this search yet. Try a different keyword or disable the remote-only
          filter.
        </div>
      )}

      {hasResults && (
        <>
          <JobFinderResultsTable results={appendedResults} onSelectJob={setSelectedJob} />
          <JobFinderPaginationControls
            hasNextPage={canRenderViewMore}
            isLoadingMore={isLoadingMore}
            onViewMore={() => setCurrentPage((previousPage) => previousPage + 1)}
          />
        </>
      )}

      <JobFinderJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobFinderClient;
