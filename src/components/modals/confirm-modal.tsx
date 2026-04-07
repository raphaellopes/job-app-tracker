"use client";

import ActionButtons from "@/components/buttons/action-buttons";
import { IconProps } from "@/components/icons/icon-props";
import Modal from "@/components/modals/modal";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  icon?: React.ComponentType<IconProps>;
  description?: string;
  confirmLabel?: string;
  confirmLoadingLabel?: string;
  cancelLabel?: string;
  isSubmitting?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  onClose,
  onConfirm,
  icon: Icon,
  description,
  confirmLabel = "Confirm",
  confirmLoadingLabel = "Submitting...",
  cancelLabel = "Cancel",
  isSubmitting = false,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal onClose={onClose}>
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3">
          {Icon && (
            <div className="mt-0.5 text-red-500 bg-red-500/10 p-3 rounded-full" aria-hidden="true">
              <Icon size="2xl" />
            </div>
          )}
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            {description && <p className="text-sm text-gray-500">{description}</p>}
          </div>
        </div>

        <ActionButtons
          items={[
            {
              id: "modal-action-cancel",
              children: cancelLabel,
              onClick: onClose,
              disabled: isSubmitting,
              className: "w-full",
              variant: "secondary",
            },
            {
              id: "modal-action-confirm",
              children: isSubmitting ? confirmLoadingLabel : confirmLabel,
              onClick: onConfirm,
              disabled: isSubmitting,
              className: "w-full",
              variant: "danger",
            },
          ]}
        />
      </div>
    </Modal>
  );
};

export default ConfirmModal;
