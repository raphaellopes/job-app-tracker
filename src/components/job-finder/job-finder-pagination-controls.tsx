import Button from "@/components/buttons/button";

interface JobFinderPaginationControlsProps {
  page: number;
  hasNextPage: boolean;
  isLoading: boolean;
  paginationLabel: string;
  onPrevious: () => void;
  onNext: () => void;
}

const JobFinderPaginationControls: React.FC<JobFinderPaginationControlsProps> = ({
  page,
  hasNextPage,
  isLoading,
  paginationLabel,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex items-center justify-between">
      <Button type="button" variant="secondary" onClick={onPrevious} disabled={page <= 1 || isLoading}>
        Previous
      </Button>
      <p className="text-sm text-gray-600">{paginationLabel}</p>
      <Button type="button" variant="secondary" onClick={onNext} disabled={!hasNextPage || isLoading}>
        Next
      </Button>
    </div>
  );
};

export default JobFinderPaginationControls;
