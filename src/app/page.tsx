import Link from 'next/link';
import { createJob, getJobs, updateJob } from '../actions/jobs';
import { SearchInput } from '@/components/search-input';
import { StatusFilter } from '@/components/status-filter';
import { SortSelect } from '@/components/sort-select';
import { JobCard } from '@/components/job-card';

export default async function Home(props: { searchParams: Promise<{ edit?: string; search?: string; status?: string; sort?: string }> }) {
  const searchParams = await props.searchParams;
  const jobs = await getJobs(searchParams.search, searchParams.status, searchParams.sort);
  const jobToEdit = searchParams.edit ? jobs.find((j) => j.id === Number(searchParams.edit)) : null;

  return (
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Job Application Tracker</h1>
      
      {/* Temporary Form to Test Server Action */}
      <div className="border p-4 rounded-lg mb-8">
        <h2 className="font-semibold mb-4">{jobToEdit ? 'Edit Job' : 'Add New Job'}</h2>
        <form action={jobToEdit ? updateJob : createJob} className="flex flex-col gap-4 max-w-md">
          {jobToEdit && <input type="hidden" name="id" value={jobToEdit.id} />}
          <input name="companyName" defaultValue={jobToEdit?.companyName} placeholder="Company Name" className="border p-2 rounded" required />
          <input name="position" defaultValue={jobToEdit?.position} placeholder="Position" className="border p-2 rounded" required />
          <select name="status" defaultValue={jobToEdit?.status} className="border p-2 rounded">
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input name="salaryRange" defaultValue={jobToEdit?.salaryRange || ''} placeholder="Salary Range" className="border p-2 rounded" />
          <textarea name="notes" defaultValue={jobToEdit?.notes || ''} placeholder="Notes" className="border p-2 rounded" />
          
          <div className="flex gap-2">
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              {jobToEdit ? 'Update Job' : 'Add Job'}
            </button>
            {jobToEdit && (
              <Link href="/" className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600">
                Cancel
              </Link>
            )}
          </div>
        </form>
      </div>

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
