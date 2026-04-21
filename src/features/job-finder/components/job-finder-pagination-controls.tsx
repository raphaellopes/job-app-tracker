import Button from "@/components/buttons/button";

interface JobFinderPaginationControlsProps {
  hasNextPage: boolean;
  isLoadingMore: boolean;
  onViewMore: () => void;
}

const JobFinderPaginationControls: React.FC<JobFinderPaginationControlsProps> = ({
  hasNextPage,
  isLoadingMore,
  onViewMore,
}) => {
  if (!hasNextPage) {
    return null;
  }

  return (
    <div className="space-y-3 flex justify-center">
      <Button
        type="button"
        onClick={onViewMore}
        disabled={isLoadingMore}
        className="w-full sm:max-w-xs"
      >
        {isLoadingMore ? "Loading more jobs..." : "View more"}
      </Button>
    </div>
  );
};

export default JobFinderPaginationControls;
