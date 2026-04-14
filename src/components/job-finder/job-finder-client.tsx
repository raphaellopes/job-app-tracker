"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";

import Button from "@/components/buttons/button";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";
import Modal from "@/components/modals/modal";

import { saveFoundJob } from "@/actions/jobs";

type JobFinderItem = {
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
};

type SearchResponse = {
  items: JobFinderItem[];
  pagination: {
    page: number;
    hasNextPage: boolean;
  };
};

const JobFinderClient: React.FC = () => {
  const [query, setQuery] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [results, setResults] = useState<JobFinderItem[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobFinderItem | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveJob = async () => {
    if (!selectedJob || isSaving) {
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveFoundJob({
        externalJobId: selectedJob.externalJobId,
        companyName: selectedJob.employerName,
        jobTitle: selectedJob.title,
        jobPublisher: selectedJob.jobPublisher,
        description: selectedJob.description,
        salaryRange: selectedJob.salary,
        externalApplyLink: selectedJob.applyLink || undefined,
        employerLogo: selectedJob.employerLogo || undefined,
        employmentTypes: selectedJob.employmentTypes,
        isRemote: selectedJob.isRemote,
        employerCompanyType: selectedJob.employerCompanyType,
        naicsName: selectedJob.naicsName,
        locationTag: selectedJob.locationTag,
        requiredSkills: selectedJob.requiredSkills,
        highlightQualifications: selectedJob.highlightQualifications,
        highlightResponsibilities: selectedJob.highlightResponsibilities,
      });

      if ("success" in result && result.success) {
        toast.success("Job saved to your wishlist.");
        return;
      }

      if ("error" in result && result.error === "already_saved") {
        toast.info("This job is already saved in your board.");
        return;
      }

      toast.error("Could not save this job.");
    } catch (error) {
      console.error("Failed saving found job:", error);
      toast.error("Something went wrong while saving the job.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            containerClassName="flex-1"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by role, company, or keywords..."
          />
          <Button type="submit" disabled={!canSearch || isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        <label className="mt-3 inline-flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={remoteOnly}
            onChange={(event) => setRemoteOnly(event.target.checked)}
            className="rounded border-gray-300"
          />
          Remote only
        </label>
      </form>

      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-3 px-4 py-3 text-xs font-semibold uppercase text-gray-500 border-b border-gray-200">
          <span className="col-span-7">Title</span>
          <span className="col-span-3">Employer</span>
          <span className="col-span-2">Publisher</span>
        </div>

        {!isLoading && !hasResults && (
          <div className="p-6 text-sm text-gray-500">Search for jobs to see results here.</div>
        )}

        {results.map((job) => (
          <button
            type="button"
            key={job.externalJobId}
            onClick={() => setSelectedJob(job)}
            className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left text-sm border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
          >
            <span className="col-span-7 font-medium text-gray-900">{job.title}</span>
            <span className="col-span-3 text-gray-700 flex items-center gap-2">
              {job.employerLogo && (
                // JSearch logo hosts vary and are not preconfigured for next/image allowlists.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.employerLogo}
                  alt={`${job.employerName} logo`}
                  width={32}
                  height={32}
                />
              )}
              {job.employerName}
            </span>
            <span className="col-span-2 text-gray-700">{job.jobPublisher}</span>
          </button>
        ))}
      </div>

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

      {selectedJob && (
        <Modal
          title={selectedJob.title}
          description={selectedJob.employerName}
          size="md"
          onClose={() => setSelectedJob(null)}
        >
          <div className="space-y-3 text-sm text-gray-700">
            <p>
              <span className="font-semibold">Employer:</span> {selectedJob.employerName}
            </p>
            <p>
              <span className="font-semibold">Job publisher:</span> {selectedJob.jobPublisher}
            </p>
            <p>
              <span className="font-semibold">Employment types:</span>{" "}
              {selectedJob.employmentTypes.length > 0
                ? selectedJob.employmentTypes.join(", ")
                : "Not provided"}
            </p>
            <p>
              <span className="font-semibold">Salary:</span> {selectedJob.salary ?? "Not provided"}
            </p>
            <p>
              <span className="font-semibold">Apply link:</span>{" "}
              {selectedJob.applyLink ? (
                <a
                  href={selectedJob.applyLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline"
                >
                  Open job post
                </a>
              ) : (
                "Not provided"
              )}
            </p>
            <div>
              <p className="font-semibold">Description</p>
              <p className="mt-1 whitespace-pre-wrap">
                {selectedJob.description || "No description available."}
              </p>
            </div>

            <div className="pt-2">
              <Button type="button" onClick={handleSaveJob} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save to wishlist"}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default JobFinderClient;
