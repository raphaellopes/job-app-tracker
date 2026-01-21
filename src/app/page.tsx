import { getJobs } from '@/actions/jobs';
import { SearchInput } from '@/components/search-input';
import { StatusFilter } from '@/components/status-filter';
import { SortSelect } from '@/components/sort-select';
import { JobCard } from '@/components/job-card';
import { JobForm } from '@/components/job-form';
import { Header } from '@/components/header';

export default async function Home(props: { searchParams: Promise<{ edit?: string; add?: string; search?: string; status?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const jobs = await getJobs(searchParams.search, searchParams.status, searchParams.sort);
  const jobToEdit = searchParams.edit ? jobs.find((j) => j.id === Number(searchParams.edit)) : null;
  const isAdding = searchParams.add === 'true';
  const isEditing = !!searchParams.edit;
  const showForm = isAdding || isEditing;

  return (
    <main className="p-10">
      <Header 
        title="Dashboard" 
        subtitle="Welcome to your job application tracker"
        addButtonDisabled={isEditing || isAdding}
      />
      
      {showForm && <JobForm job={jobToEdit} />}

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
