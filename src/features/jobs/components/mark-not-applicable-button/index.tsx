"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { BanIcon } from "@/components/icons/ban-icon";
import ConfirmModal from "@/components/modals/confirm-modal";

import { jobErrorMessage } from "@/features/jobs/errors";
import { jobsKeys } from "@/features/jobs/query-keys";
import { markJobNotApplicable } from "@/features/jobs/server/actions";

interface MarkNotApplicableButtonProps {
  id: number;
  className?: string;
}

const MarkNotApplicableButton: React.FC<MarkNotApplicableButtonProps> = ({ id, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const closeModal = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleConfirm = async () => {
    try {
      setIsSubmitting(true);
      const result = await markJobNotApplicable(id);
      setIsOpen(false);
      if ("success" in result && result.success) {
        await queryClient.invalidateQueries({ queryKey: jobsKeys.all });
        toast.success("Job marked as not a fit.");
      } else if ("error" in result) {
        toast.error(jobErrorMessage(result.error));
      }
      router.refresh();
    } catch (error) {
      console.error("Error marking job as not a fit:", error);
      toast.error("Something went wrong while updating the job.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        className={className ?? "hidden group-hover:block text-gray-400 hover:text-amber-600 transition-colors cursor-pointer"}
        aria-label="Mark as not a fit"
        onClick={() => setIsOpen(true)}
      >
        <BanIcon className="w-4 h-4" />
      </button>
      {isOpen && (
        <ConfirmModal
          isOpen={isOpen}
          title="Mark as not a fit?"
          description="This job will be hidden from your board but remembered in Job Finder."
          onClose={closeModal}
          onConfirm={handleConfirm}
          icon={BanIcon}
          cancelLabel="Cancel"
          confirmLabel="Mark as not a fit"
          confirmLoadingLabel="Updating..."
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default MarkNotApplicableButton;
