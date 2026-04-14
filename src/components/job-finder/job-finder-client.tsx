"use client";

import { useMemo, useState } from "react";

import Button from "@/components/buttons/button";
import JobFinderJobModal from "@/components/job-finder/job-finder-job-modal";
import JobFinderResultsTable from "@/components/job-finder/job-finder-results-table";
import JobFinderSearchForm from "@/components/job-finder/job-finder-search-form";
import { JobFinderItem, SearchResponse } from "@/components/job-finder/types";

const JobFinderClient: React.FC = () => {
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [results, setResults] = useState<JobFinderItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobFinderItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const canSearch = query.trim().length > 0;
  const hasResults = results.length > 0;

  const paginationLabel = useMemo(() => `Page ${page}`, [page]);

  const runSearch = async (nextPage: number) => {
    if (!query.trim()) {
      setErrorMessage("Enter a search query to find jobs.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        page: String(nextPage),
        remoteOnly: String(remoteOnly),
      });
      const response = await fetch(`/api/job-finder/search?${params.toString()}`);
      if (!response.ok) {
        setErrorMessage("Could not load jobs right now. Please try again.");
        return;
      }

      const payload = (await response.json()) as SearchResponse;
      setResults(payload.items);
      setPage(payload.pagination.page);
      setHasNextPage(payload.pagination.hasNextPage);
    } catch (error) {
      console.error("Job finder search failed:", error);
      setErrorMessage("Something went wrong while searching jobs.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSearch(1);
  };

  return (
    <div className="space-y-6">
      <JobFinderSearchForm
        query={query}
        remoteOnly={remoteOnly}
        isLoading={isLoading}
        canSearch={canSearch}
        errorMessage={errorMessage}
        onQueryChange={setQuery}
        onRemoteOnlyChange={setRemoteOnly}
        onSubmit={handleSubmit}
      />

      <JobFinderResultsTable
        results={results}
        isLoading={isLoading}
        hasResults={hasResults}
        onSelectJob={setSelectedJob}
      />

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          onClick={() => runSearch(page - 1)}
          disabled={page <= 1 || isLoading}
        >
          Previous
        </Button>
        <p className="text-sm text-gray-600">{paginationLabel}</p>
        <Button
          type="button"
          variant="secondary"
          onClick={() => runSearch(page + 1)}
          disabled={!hasNextPage || isLoading}
        >
          Next
        </Button>
      </div>

      <JobFinderJobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default JobFinderClient;
