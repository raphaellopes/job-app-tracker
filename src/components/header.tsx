import { AddJobButton } from '@/components/add-job-button';

interface HeaderProps {
  title: string;
  showAddButton?: boolean;
  addButtonDisabled?: boolean;
}

export function Header({ title, showAddButton = true, addButtonDisabled = false }: HeaderProps) {
  return (
    <header className="flex items-center gap-3 mb-6">
      <h1 className="flex-1 text-3xl font-bold">{title}</h1>
      {showAddButton && <AddJobButton isDisabled={addButtonDisabled} />}
    </header>
  );
}
