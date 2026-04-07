import classNames from "classnames";
import { BriefcaseIcon } from "@/components/icons/briefcase-icon";

type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  size?: LogoSize;
}

type StyleType = {
  container?: string;
  text?: string;
  icon?: string;
};

const styles: Record<LogoSize, StyleType> = {
  sm: {
    container: "gap-2",
    text: "text-sm",
    icon: "w-5 h-5",
  },
  md: {
    container: "gap-3",
    text: "text-lg",
    icon: "w-6 h-6",
  },
  lg: {
    container: "gap-4",
    text: "text-2xl",
    icon: "w-10 h-10",
  },
};

export const Logo: React.FC<LogoProps> = ({ size = "md" }) => {
  const style = styles[size];
  return (
    <div className={classNames("flex items-center", style.container)}>
      <BriefcaseIcon className={classNames("text-gray-900 flex-shrink-0", style.icon)} />
      <span className={classNames("font-bold text-gray-900", style.text)}>Job Tracker</span>
    </div>
  );
};

export default Logo;
