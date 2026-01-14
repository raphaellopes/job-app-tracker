import { createJob, getJobs } from '../actions/jobs';

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
            <div key={job.id} className="border p-4 rounded-lg shadow-sm bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-gray-800">{job.companyName}</h3>
                <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-400">
                  {job.status}
                </span>
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
