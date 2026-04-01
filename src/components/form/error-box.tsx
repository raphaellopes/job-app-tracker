import { WarningIcon } from "@/components/icons/warning-icon";
import Card from "../card";

interface ErrorBoxProps extends React.HTMLAttributes<HTMLDivElement> {}

const ErrorBox: React.FC<ErrorBoxProps> = ({ children, ...props }) => {
  return (
    <Card variant="error" {...props}>
      <div className="flex items-center gap-2">
        <WarningIcon />
        {children}
      </div>
    </Card>
  );
};

export default ErrorBox;
