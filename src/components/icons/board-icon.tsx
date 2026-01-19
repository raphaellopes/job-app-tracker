import classNames from 'classnames';
import { IconProps, sizeClasses } from './icon-props';

export function BoardIcon(props: IconProps) {
  const { size = 'base', className, ...restProps } = props;
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
      <rect width="18" height="18" x="3" y="3" rx="2"></rect>
      <path d="M8 7v7M12 7v4M16 7v9"></path>
    </svg>
  );
}
