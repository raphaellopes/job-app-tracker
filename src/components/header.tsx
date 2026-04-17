import { AddJobButton } from "@/features/jobs";

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showAddButton = true,
  addButtonDisabled = false,
}) => {
  return (
    <header className="flex items-center gap-3 mb-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <h2 className="text-gray-500">{subtitle}</h2>}
      </div>
      {showAddButton && <AddJobButton isDisabled={addButtonDisabled} />}
    </header>
  );
};

export default Header;
