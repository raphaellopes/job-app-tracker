import classNames from "classnames";

import { IconProps, sizeClasses } from "./icon-props";

export function BanIcon(props: IconProps) {
  const { size = "base", className, ...restProps } = props;
  const mergedClassName = classNames(sizeClasses[size], className);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={mergedClassName}
      {...restProps}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
      />
    </svg>
  );
}
