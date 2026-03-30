import classNames from "classnames";
import { IconProps, sizeClasses } from "./icon-props";

export function BriefcaseIcon(props: IconProps) {
  const { size = "base", className, ...restProps } = props;
  const mergedClassName = classNames(sizeClasses[size], className);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      className={mergedClassName}
      {...restProps}
    >
      <path
        stroke="#000"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M16 7v-.8c0-1.12 0-1.68-.218-2.108a2 2 0 0 0-.874-.874C14.48 3 13.92 3 12.8 3h-1.6c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C8 4.52 8 5.08 8 6.2V7m1 8v-3m6 3v-3M3.027 10.026C3.387 10.372 7.286 14 12 14s8.612-3.628 8.973-3.974m-17.946 0C3 10.493 3 11.066 3 11.8v4.4c0 1.68 0 2.52.327 3.162a3 3 0 0 0 1.311 1.311C5.28 21 6.12 21 7.8 21h8.4c1.68 0 2.52 0 3.162-.327a3 3 0 0 0 1.311-1.311C21 18.72 21 17.88 21 16.2v-4.4c0-.734 0-1.307-.027-1.774m-17.946 0c.035-.602.116-1.026.3-1.388a3 3 0 0 1 1.311-1.311C5.28 7 6.12 7 7.8 7h8.4c1.68 0 2.52 0 3.162.327a3 3 0 0 1 1.311 1.311c.184.362.265.786.3 1.388"
      ></path>
    </svg>
  );
}
