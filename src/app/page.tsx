import { createJob, getJobs, deleteJob } from '../actions/jobs';

export default async function Home() {
  const jobs = await getJobs();

  return (
    <main className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold mb-6">Job Application Tracker</h1>
      
      {/* Temporary Form to Test Server Action */}
      <div className="border p-4 rounded-lg mb-8">
        <h2 className="font-semibold mb-4">Add New Job</h2>
        <form action={createJob} className="flex flex-col gap-4 max-w-md">
          <input name="companyName" placeholder="Company Name" className="border p-2 rounded" required />
          <input name="position" placeholder="Position" className="border p-2 rounded" required />
          <select name="status" className="border p-2 rounded">
            <option value="WISHLIST">Wishlist</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEWING">Interviewing</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <input name="salaryRange" placeholder="Salary Range" className="border p-2 rounded" />
          <textarea name="notes" placeholder="Notes" className="border p-2 rounded" />
          
          <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
            Add Job
          </button>
        </form>
      </div>

      {/* Job List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Jobs</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <div key={job.id} className="border p-4 rounded-lg shadow-sm bg-white group">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{job.companyName}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-400">
                    {job.status}
                  </span>
                  <form action={deleteJob} className="hidden group-hover:block">
                    <input type="hidden" name="id" value={job.id} />
                    <button type="submit" className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </form>
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
