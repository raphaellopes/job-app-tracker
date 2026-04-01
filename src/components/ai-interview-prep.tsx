"use client";

import { useState } from "react";
import { analyzeJob, type InterviewPrepResult } from "@/actions/gemini-service";
import AIInterviewPrepResult from "@/components/ai-interview-prep-result";
import { Job } from "@/db/schema";

interface AIInterviewPrepProps {
  job: Job;
}

const AIInterviewPrep: React.FC<AIInterviewPrepProps> = ({ job }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewPrepResult | null>(null);

  const handleGenerateInterviewPrep = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const next = await analyzeJob(job);
      if (next === null) {
        setError("Could not parse the AI response. Please try again.");
        return;
      }
      setResult(next);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const buttonLabel = isGenerating
    ? "Generating..."
    : result
      ? "Regenerate Interview Prep"
      : "Generate Interview Prep";

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <h3 className="text-sm font-semibold text-blue-900">AI Interview Prep</h3>
      <p className="mt-1 text-sm text-blue-800">
        Get AI-generated interview questions and resume matching analysis for this specific role.
      </p>

      <div className="mt-3">
        <button
          type="button"
          className="button-primary w-full"
          disabled={isGenerating}
          onClick={handleGenerateInterviewPrep}
        >
          {buttonLabel}
        </button>
      </div>

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {result ? <AIInterviewPrepResult result={result} /> : null}
    </section>
  );
};

export default AIInterviewPrep;
