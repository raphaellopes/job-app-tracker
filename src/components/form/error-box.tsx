import { WarningIcon } from "@/components/icons/warning-icon";

interface ErrorBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const ErrorBox: React.FC<ErrorBoxProps> = ({ children, ...props }) => {
  return (
    <div className="flex items-center gap-2 bg-red-500/10 p-2 rounded-md text-sm" {...props}>
      <WarningIcon />
      {children}
    </div>
  );
};

export default ErrorBox;
