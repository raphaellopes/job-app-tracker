import classNames from "classnames";

import { IconProps, sizeClasses } from "./icon-props";

export function CheckboxCheckedIcon(props: IconProps) {
  const { size = "base", className, ...restProps } = props;
  const mergedClassName = classNames(sizeClasses[size], className);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      viewBox="0 -960 960 960"
      className={mergedClassName}
      {...restProps}
    >
      <path d="m424-312 282-282-56-56-226 226-114-114-56 56zM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120zm0-80h560v-560H200zm0-560v560z"></path>{" "}
    </svg>
  );
}
