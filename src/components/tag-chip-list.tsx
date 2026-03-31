import classNames from "classnames";
import TagChip from "@/components/tag-chip";

interface TagChipListProps {
  tags?: string[] | null;
  className?: string;
}

const TagChipList: React.FC<TagChipListProps> = ({ tags, className }) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className={classNames("flex flex-wrap gap-1", className)}>
      {tags.map((tag) => (
        <TagChip key={tag} label={tag} />
      ))}
    </div>
  );
};

export default TagChipList;
