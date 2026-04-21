"use client";

import ErrorBox from "@/components/form/error-box";

import AIInterviewPrep from "@/features/ai-interview-prep/components/ai-interview-prep";
import { useJobInterviewPrep } from "@/features/ai-interview-prep/queries";
import type { Job } from "@/features/jobs/types";

interface LazyAIInterviewPrepProps {
  job: Job;
}

const LazyAIInterviewPrep: React.FC<LazyAIInterviewPrepProps> = ({ job }) => {
  const { data, isLoading, error } = useJobInterviewPrep(job.id);

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading saved interview prep...</p>;
  }

  if (error) {
    return (
      <ErrorBox>
        {error instanceof Error ? error.message : "Could not load saved interview prep."}
      </ErrorBox>
    );
  }

  return <AIInterviewPrep job={job} initialSavedResult={data ?? null} />;
};

export default LazyAIInterviewPrep;
