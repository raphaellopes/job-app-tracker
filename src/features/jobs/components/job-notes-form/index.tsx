"use client";

import { useEffect, useRef, useState } from "react";

import Textarea from "@/components/form/textarea";
import { useUpdateJobNotes } from "@/features/jobs/mutations";
import type { JobsBoardFilters } from "@/features/jobs/types";

interface JobNotesFormProps {
  jobId: number;
  initialNotes?: string | null;
  filters?: JobsBoardFilters;
}

const SAVE_DEBOUNCE_MS = 700;

const JobNotesForm: React.FC<JobNotesFormProps> = ({ jobId, initialNotes, filters = {} }) => {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);
  const lastSavedNotesRef = useRef(initialNotes ?? "");
  const mutation = useUpdateJobNotes(filters);

  const saveNotes = async (nextNotes: string) => {
    if (nextNotes === lastSavedNotesRef.current) return;
    setError(null);
    try {
      const result = await mutation.mutateAsync({ jobId, notes: nextNotes });
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      lastSavedNotesRef.current = nextNotes;
    } catch {
      setError("Failed to save notes.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void saveNotes(notes);
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [notes]);

  const handleBlur = async () => {
    await saveNotes(notes);
  };

  return (
    <div className="space-y-2">
      <Textarea
        id={`job-notes-${jobId}`}
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        onBlur={handleBlur}
        placeholder="Add interview prep notes, key contacts, follow-ups..."
        rows={6}
        error={error}
      />
      <p className="text-xs text-gray-500">
        {mutation.isPending ? "Saving..." : "Saved automatically"}
      </p>
    </div>
  );
};

export default JobNotesForm;
