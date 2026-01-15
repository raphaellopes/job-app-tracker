import { SVGProps } from 'react';

export type IconSize = 'base' | 'sm' | 'lg';

export const sizeClasses: Partial<Record<IconSize, string>> = {
  base: 'w-4 h-4',
} as const;

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'className'> {
  size?: IconSize;
  className?: string;
}
