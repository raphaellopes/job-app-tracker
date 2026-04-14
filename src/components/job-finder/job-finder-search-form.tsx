import Button from "@/components/buttons/button";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";

interface JobFinderSearchFormProps {
  query: string;
  remoteOnly: boolean;
  isLoading: boolean;
  canSearch: boolean;
  errorMessage: string | null;
  onQueryChange: (nextQuery: string) => void;
  onRemoteOnlyChange: (isRemoteOnly: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const JobFinderSearchForm: React.FC<JobFinderSearchFormProps> = ({
  query,
  remoteOnly,
  isLoading,
  canSearch,
  errorMessage,
  onQueryChange,
  onRemoteOnlyChange,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            containerClassName="flex-1"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
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
            onChange={(event) => onRemoteOnlyChange(event.target.checked)}
            className="rounded border-gray-300"
          />
          Remote only
        </label>
      </form>

      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </div>
  );
};

export default JobFinderSearchForm;
