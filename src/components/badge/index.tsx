import classNames from "classnames";
import type { FC } from "react";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement>;

const Badge: FC<BadgeProps> = ({ className, children, ...props }) => {
  return (
    <span
      className={classNames(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
