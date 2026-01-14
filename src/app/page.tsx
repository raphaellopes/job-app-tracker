import { createJob } from '../actions/jobs';

export default function Home() {
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

    </main>
  );
}
