import classNames from "classnames";

interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  min?: number;
  max?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  className,
  "aria-label": ariaLabel,
  min = 0,
  max = 100,
}) => {
  const clamped = Math.min(max, Math.max(min, value));

  return (
    <div
      className={classNames("h-3 w-full overflow-hidden rounded-full bg-gray-200", className)}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={ariaLabel ?? "Progress"}
    >
      <div
        className="h-full rounded-full bg-blue-500 transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};

export default ProgressBar;
