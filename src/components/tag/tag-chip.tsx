import classNames from "classnames";

interface TagChipProps {
  label: string;
  className?: string;
}

const TagChip: React.FC<TagChipProps> = ({ label, className }) => {
  return (
    <span
      className={classNames(
        "inline-block max-w-full truncate rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800",
        className,
      )}
      title={label}
    >
      {label}
    </span>
  );
};

export default TagChip;
