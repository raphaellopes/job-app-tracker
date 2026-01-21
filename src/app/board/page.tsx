import { getJobs } from '@/actions/jobs';
import { SearchInput } from '@/components/search-input';
import { StatusFilter } from '@/components/status-filter';
import { SortSelect } from '@/components/sort-select';
import { JobCard } from '@/components/job-card';
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

      {/* Job List */}
      <div className="space-y-4">
        <div className="flex gap-4 mb-6">
          <SearchInput />
          <StatusFilter />
          <SortSelect />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
          {jobs.length === 0 && (
            <p className="text-gray-500 col-span-full">No jobs tracked yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
