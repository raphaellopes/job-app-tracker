"use client";

import { useState } from "react";
import { analyzeJob } from "@/actions/gemini-service";
import { Job } from "@/db/schema";

interface AIInterviewPrepProps {
  job: Job;
}

export function AIInterviewPrep({ job }: AIInterviewPrepProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const handleGenerateInterviewPrep = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await analyzeJob(job);
      setResult(result);
    } catch (error) {
      setError(error as string);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <h3 className="text-sm font-semibold text-blue-900">AI Interview Prep</h3>
      <p className="mt-1 text-sm text-blue-800">
        Get AI-generated interview questions and resume matching analysis for this specific role.
      </p>

      <div className="mt-3">
        <button className="button-primary w-full" onClick={handleGenerateInterviewPrep}>
          {isGenerating ? "Generating..." : "Generate Interview Prep"}
        </button>
      </div>
    </section>
  );
}
