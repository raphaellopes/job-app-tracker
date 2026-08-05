"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import Button from "@/components/buttons/button";

import { jobErrorMessage } from "@/features/jobs/errors";
import { jobsKeys } from "@/features/jobs/query-keys";
import { restoreJob } from "@/features/jobs/server/actions";

interface RestoreJobButtonProps {
  jobId: number;
}

const RestoreJobButton: React.FC<RestoreJobButtonProps> = ({ jobId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleRestore = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await restoreJob(jobId);
      if ("success" in result && result.success) {
        await queryClient.invalidateQueries({ queryKey: jobsKeys.all });
        toast.success("Job restored to wishlist.");
      } else if ("error" in result) {
        toast.error(jobErrorMessage(result.error));
      }
      router.refresh();
    } catch (error) {
      console.error("Error restoring job:", error);
      toast.error("Something went wrong while restoring the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Button type="button" variant="secondary" onClick={handleRestore} disabled={isSubmitting}>
      {isSubmitting ? "Restoring..." : "Restore to wishlist"}
    </Button>
  );
};

export default RestoreJobButton;
