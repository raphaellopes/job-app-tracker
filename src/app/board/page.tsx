import { getJobs } from '@/actions/jobs';
import { SearchInput } from '@/components/search-input';
import { StatusFilter } from '@/components/status-filter';
import { SortSelect } from '@/components/sort-select';
import { JobCard } from '@/components/job-card';
import { JobForm } from '@/components/job-form';
import { Header } from '@/components/header';
import { getFormState } from '@/utils/form-state';

export default async function Board(props: { searchParams: Promise<{ edit?: string; add?: string; search?: string; status?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const { isAdding, isEditing, showForm } = getFormState(searchParams);
  const jobs = await getJobs(searchParams.search, searchParams.status, searchParams.sort);
  const jobToEdit = searchParams.edit ? jobs.find((j) => j.id === Number(searchParams.edit)) : null;

  return (
    <main className="p-10">
      <Header 
        title="Board" 
        subtitle="Manage and view all your job applications"
        addButtonDisabled={isEditing || isAdding}
      />
      
      {showForm && <JobForm job={jobToEdit} returnPath="/board" />}

      {/* Job List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Jobs</h2>
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
