import classNames from "classnames";
import { IconProps, sizeClasses } from "./icon-props";

export function MenuIcon(props: IconProps) {
  const { size = "base", className, ...restProps } = props;
  const mergedClassName = classNames(sizeClasses[size], className);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      fill="currentColor"
      viewBox="0 -960 960 960"
      className={mergedClassName}
      {...restProps}
    >
      <path d="M120-240v-80h720v80zm0-200v-80h720v80zm0-200v-80h720v80z"></path>
    </svg>
  );
}
