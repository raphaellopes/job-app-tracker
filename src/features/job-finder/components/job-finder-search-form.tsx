import Button from "@/components/buttons/button";
import Checkbox from "@/components/form/checkbox";
import ErrorBox from "@/components/form/error-box";
import Input from "@/components/form/input";

interface JobFinderSearchFormProps {
  query: string;
  remoteOnly: boolean;
  isSearching: boolean;
  canSearch: boolean;
  errorMessage: string | null;
  onQueryChange: (nextQuery: string) => void;
  onRemoteOnlyChange: (isRemoteOnly: boolean) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const JobFinderSearchForm: React.FC<JobFinderSearchFormProps> = ({
  query,
  remoteOnly,
  isSearching,
  canSearch,
  errorMessage,
  onQueryChange,
  onRemoteOnlyChange,
  onSubmit,
}) => {
  return (
    <div className="space-y-4">
      <form
        onSubmit={onSubmit}
        className="bg-white border border-gray-200 rounded-lg p-4 space-y-4"
      >
        <div className="flex flex-col gap-4 sm:flex-row">
          <Input
            containerClassName="flex-1"
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Search by role, company, or keywords..."
          />
          <Button type="submit" disabled={!canSearch || isSearching}>
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </div>
        <Checkbox
          id="remote-only"
          checked={remoteOnly}
          onChange={(event) => onRemoteOnlyChange(event.target.checked)}
          label="Remote only"
        />
      </form>

      {errorMessage && <ErrorBox>{errorMessage}</ErrorBox>}
    </div>
  );
};

export default JobFinderSearchForm;
