import { ReactNode } from "react";
import classNames from "classnames";

import { CloseIcon } from "@/components/icons/close-icon";

type ModalSizes = "sm" | "md";

interface ModalProps {
  title?: string;
  description?: string;
  size?: ModalSizes;
  onClose: () => void;
  children: ReactNode;
}

const modalSizeClasses: Record<ModalSizes, string> = {
  sm: "max-w-md",
  md: "max-w-4xl",
};

const Modal: React.FC<ModalProps> = ({ title, description, size = "sm", onClose, children }) => {
  const maxWidthClassName = modalSizeClasses[size];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className={classNames(
          "bg-white rounded-2xl shadow-xl w-full mx-4 max-h-[90vh] overflow-y-auto",
          maxWidthClassName,
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-4 gap-4">
          <div>
            {title && <h2 className="text-xl font-semibold">{title}</h2>}
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
