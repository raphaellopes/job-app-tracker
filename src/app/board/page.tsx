import { getJobs } from '@/actions/jobs';
import { SearchInput } from '@/components/search-input';
import { StatusFilter } from '@/components/status-filter';
import { SortSelect } from '@/components/sort-select';
import { KanbanBoard } from '@/components/kanban-board';
import { Header } from '@/components/header';
import { getFormState } from '@/utils/form-state';
import { JobModal } from '@/components/modals/job-modal';

interface BoardProps {
  searchParams: Promise<{ edit?: string; add?: string; search?: string; status?: string; sort?: string }>;
}

export default async function Board(props: BoardProps) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing } = getFormState(searchParams);
  const jobs = await getJobs(searchParams.search, searchParams.status, searchParams.sort);
  const jobToEdit = searchParams.edit ? jobs.find((j) => j.id === Number(searchParams.edit)) : undefined;

  return (
    <main className="p-10">
      <Header 
        title="Board" 
        subtitle="Manage and view all your job applications"
        addButtonDisabled={isEditing || isAdding}
      />
      
      <JobModal job={jobToEdit} />

      {/* Kanban Board */}
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <SearchInput />
          <StatusFilter />
          <SortSelect />
        </div>
        <KanbanBoard jobs={jobs} />
      </div>
    </main>
  );
}
