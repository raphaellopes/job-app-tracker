import { JobFinderItem } from "@/features/job-finder/types";

interface JobFinderResultsTableProps {
  results: JobFinderItem[];
  isLoading: boolean;
  hasResults: boolean;
  onSelectJob: (job: JobFinderItem) => void;
}

const JobFinderResultsTable: React.FC<JobFinderResultsTableProps> = ({
  results,
  isLoading,
  hasResults,
  onSelectJob,
}) => {
  return (
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
          onClick={() => onSelectJob(job)}
          className="grid w-full grid-cols-12 gap-3 px-4 py-3 text-left text-sm border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
        >
          <span className="col-span-7 font-medium text-gray-900">{job.title}</span>
          <span className="col-span-3 text-gray-700 flex items-center gap-2">
            {job.employerLogo && (
              // JSearch logo hosts vary and are not preconfigured for next/image allowlists.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={job.employerLogo} alt={`${job.employerName} logo`} width={32} height={32} />
            )}
            {job.employerName}
          </span>
          <span className="col-span-2 text-gray-700">{job.jobPublisher}</span>
        </button>
      ))}
    </div>
  );
};

export default JobFinderResultsTable;
