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
          "bg-white shadow-xl w-full overflow-y-auto",
          maxWidthClassName,
          !isSmallSize && "sm:mx-4 max-h-[100vh] sm:max-h-[90vh] sm:rounded-2xl",
          isSmallSize && "rounded-2xl mx-4",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader
          className="bg-white sticky top-0"
          title={title ?? ""}
          description={description}
          onClose={onClose}
        />
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
