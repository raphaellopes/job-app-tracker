"use client";

import { useState } from "react";
import { Job } from "@/db/schema";
import { analyzeJob, type InterviewPrepResult } from "@/actions/gemini";
import AIInterviewPrepResult from "@/components/ai-interview-prep-result";
import ErrorBox from "@/components/form/error-box";
import type { ButtonProps } from "@/components/buttons/button";
import ActionButtons from "./buttons/action-buttons";

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

  const getButtonLabel = () => {
    if (isGenerating) return "Generating...";
    if (result) return "Regenerate";
    return "Generate";
  };

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <h3 className="text-sm font-semibold text-blue-900">AI Interview Prep</h3>
      <p className="mt-1 text-sm text-blue-800">
        Get AI-generated interview questions and resume matching analysis for this specific role.
      </p>

      <div className="mt-3">
        <ActionButtons
          items={
            [
              {
                id: "generate",
                type: "button",
                className: "w-full",
                disabled: isGenerating,
                onClick: handleGenerateInterviewPrep,
                children: getButtonLabel(),
              },
              result && {
                id: "save",
                type: "button",
                className: "w-full",
                onClick: () => console.log("it should save!"),
                children: "Save",
              },
            ].filter(Boolean) as ButtonProps[]
          }
        />
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {result && <AIInterviewPrepResult result={result} />}
    </section>
  );
};

export default AIInterviewPrep;
