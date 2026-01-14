import Link from 'next/link';
import { createJob, getJobs, updateJob } from '../actions/jobs';
import { DeleteJobButton } from '../components/DeleteJobButton';
import { SearchInput } from '../components/SearchInput';

export default async function Home(props: { searchParams: Promise<{ edit?: string; search?: string }> }) {
  const searchParams = await props.searchParams;
  const jobs = await getJobs(searchParams.search);
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
        <SearchInput />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="border p-4 rounded-lg shadow-sm bg-white group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{job.companyName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-400">
                    {job.status}
                  </span>
                  <Link href={`/?edit=${job.id}`} className="hidden group-hover:block text-gray-400 hover:text-blue-500 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                  </Link>
                  <DeleteJobButton id={job.id} />
                </div>
              </div>
              <p className="text-gray-600 mb-2">{job.position}</p>
              {job.salaryRange && (
                <p className="text-sm text-gray-500">💰 {job.salaryRange}</p>
              )}
              {job.notes && (
                <p className="text-sm text-gray-500 mt-2 italic truncate">
                  {job.notes}
                </p>
              )}
            </div>
          ))}
          {jobs.length === 0 && (
            <p className="text-gray-500 col-span-full">No jobs tracked yet.</p>
          )}
        </div>
      </div>
    </main>
  );
}
