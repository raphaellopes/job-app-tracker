import classNames from 'classnames';
import { IconProps, sizeClasses } from './icon-props';

export function PlusIcon(props: IconProps) {
  const { size = 'base', className, ...restProps } = props;
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
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}
