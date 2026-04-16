import { ReactNode } from "react";
import classNames from "classnames";

import ModalHeader from "./modal-header";

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
  const isSmallSize = size === "sm";

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
        <ModalHeader title={title ?? ""} description={description} onClose={onClose} />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
