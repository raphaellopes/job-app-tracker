import classNames from "classnames";

import { CloseIcon } from "@/components/icons/close-icon";

interface ModalHeaderProps {
  title: string;
  description?: string;
  onClose?: () => void;
  className?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, description, onClose, className }) => {
  return (
    <div className={classNames("flex items-start justify-between p-4 gap-4", className)}>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-4 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

export default ModalHeader;
