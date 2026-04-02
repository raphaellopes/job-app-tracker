"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { updateJobNotes } from "@/actions/jobs";
import Textarea from "@/components/form/textarea";

interface JobNotesFormProps {
  jobId: number;
  initialNotes?: string | null;
}

const SAVE_DEBOUNCE_MS = 700;

const JobNotesForm: React.FC<JobNotesFormProps> = ({ jobId, initialNotes }) => {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastSavedNotesRef = useRef(initialNotes ?? "");

  const saveNotes = useCallback(
    async (nextNotes: string) => {
      if (nextNotes === lastSavedNotesRef.current) return;

      setIsSaving(true);
      setError(null);

      try {
        const result = await updateJobNotes(jobId, nextNotes);
        if ("error" in result && result.error) {
          setError(result.error);
          return;
        }

        lastSavedNotesRef.current = nextNotes;
      } catch {
        setError("Failed to save notes.");
      } finally {
        setIsSaving(false);
      }
    },
    [jobId],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void saveNotes(notes);
    }, SAVE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [notes, saveNotes]);

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
      <p className="text-xs text-gray-500">{isSaving ? "Saving..." : "Saved automatically"}</p>
    </div>
  );
};

export default JobNotesForm;
