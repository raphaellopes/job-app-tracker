import { AddJobButton } from '@/components/add-job-button';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
}

export function Header({ title, subtitle, showAddButton = true, addButtonDisabled = false }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 mb-6">
      <div className="flex-1">
        <h1 className="text-3xl font-bold">{title}</h1>
        {subtitle && <h2 className="text-gray-500">{subtitle}</h2>}
      </div>
      {showAddButton && <AddJobButton isDisabled={addButtonDisabled} />}
    </header>
  );
}
