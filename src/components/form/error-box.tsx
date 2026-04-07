import { WarningIcon } from "@/components/icons/warning-icon";

import Card from "../cards/card";

const ErrorBox: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) => {
  return (
    <Card variant="error" {...props}>
      <div className="flex items-center gap-2">
        <span>
          <WarningIcon />
        </span>
        {children}
      </div>
    </Card>
  );
};

export default ErrorBox;
