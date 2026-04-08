"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { TrashIcon } from "@/components/icons/trash-icon";
import ConfirmModal from "@/components/modals/confirm-modal";

import { deleteJob } from "@/actions/jobs";

interface DeleteJobButtonProps {
  id: number;
}

const DeleteJobButton: React.FC<DeleteJobButtonProps> = ({ id }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const closeModal = () => {
    if (!isSubmitting) {
      setIsOpen(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append("id", id.toString());
      const result = await deleteJob(formData);
      closeModal();
      if ("success" in result && result.success) {
        toast.success("Job removed successfully.");
      }
      router.refresh();
    } catch (error) {
      console.error("Error deleting job:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setIsOpen(true);
        }}
        className="hidden group-hover:flex"
      >
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </form>
      {isOpen && (
        <ConfirmModal
          isOpen={isOpen}
          title="Delete this job?"
          description="This action cannot be undone."
          onClose={() => {
            closeModal();
          }}
          onConfirm={handleDelete}
          icon={TrashIcon}
          cancelLabel="Cancel"
          confirmLabel="Delete"
          confirmLoadingLabel="Deleting..."
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default DeleteJobButton;
