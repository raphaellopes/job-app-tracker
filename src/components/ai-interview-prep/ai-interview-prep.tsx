"use client";

import { useState } from "react";
import { Job } from "@/db/schema";
import { analyzeJob, type InterviewPrepResult } from "@/actions/gemini";
import { saveJobInterviewPrep } from "@/actions/jobs";
import AIInterviewPrepResult from "@/components/ai-interview-prep/ai-interview-prep-result";
import ErrorBox from "@/components/form/error-box";
import type { ButtonProps } from "@/components/buttons/button";
import ActionButtons from "@/components/buttons/action-buttons";

interface AIInterviewPrepProps {
  job: Job;
  initialSavedResult?: InterviewPrepResult | null;
}

const AIInterviewPrep: React.FC<AIInterviewPrepProps> = ({ job, initialSavedResult = null }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<InterviewPrepResult | null>(initialSavedResult);
  const [isSaved, setIsSaved] = useState(Boolean(initialSavedResult));

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
      setIsSaved(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong. Please try again.";
      setError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveInterviewPrep = async () => {
    if (!result) return;

    setIsSaving(true);
    setError(null);

    try {
      const saveResult = await saveJobInterviewPrep(job.id, result);
      if ("error" in saveResult) {
        setError(saveResult.error);
        return;
      }

      setIsSaved(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong while saving.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const getGenerateResultButtonLabel = () => {
    if (isGenerating) return "Generating...";
    if (result) return "Regenerate";
    return "Generate";
  };

  const getSaveResultButtonLabel = () => {
    if (isSaving) return "Saving...";
    if (isSaved) return "Saved";
    return "Save";
  };

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4 space-y-4">
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-blue-900">AI Interview Prep</h3>
        <p className="text-sm text-blue-800">
          Get AI-generated interview questions and resume matching analysis for this specific role.
        </p>
      </div>

      <div>
        <ActionButtons
          items={
            [
              {
                id: "generate",
                type: "button",
                className: "w-full",
                disabled: isGenerating || isSaving,
                onClick: handleGenerateInterviewPrep,
                children: getGenerateResultButtonLabel(),
              },
              result && {
                id: "save",
                type: "button",
                className: "w-full",
                disabled: isSaving || isSaved,
                onClick: handleSaveInterviewPrep,
                children: getSaveResultButtonLabel(),
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
