import { SVGProps } from "react";

export type IconSize = "base" | "sm" | "lg" | "xl" | "2xl";

export const sizeClasses: Partial<Record<IconSize, string>> = {
  base: "w-4 h-4",
  sm: "w-3 h-3",
  lg: "w-5 h-5",
  xl: "w-7 h-7",
  "2xl": "w-9 h-9",
} as const;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  size?: IconSize;
  className?: string;
}
