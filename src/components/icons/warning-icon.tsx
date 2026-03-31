import classNames from "classnames";
import { IconProps, sizeClasses } from "./icon-props";

export function WarningIcon(props: IconProps) {
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
      <path d="m40-120 440-760 440 760zm138-80h604L480-720zm330.5-51.5Q520-263 520-280t-11.5-28.5T480-320t-28.5 11.5T440-280t11.5 28.5T480-240t28.5-11.5M440-360h80v-200h-80zm40-100"></path>
    </svg>
  );
}
