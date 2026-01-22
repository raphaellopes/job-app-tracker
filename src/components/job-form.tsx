import { Job } from '@/db/schema';
import { createJob, updateJob } from '@/actions/jobs';
import { JobStatusType } from '@/actions/jobs';

interface JobFormProps {
  job?: Job | null;
  initialStatus?: JobStatusType;
}

export function JobForm({ job, initialStatus }: JobFormProps) {
  // Use initialStatus if provided, otherwise fall back to job?.status
  const statusValue = initialStatus || job?.status;

  return (
    <div className="">
      <form action={job ? updateJob : createJob} className="flex flex-col gap-4 max-w-md">
        {job && <input type="hidden" name="id" value={job.id} />}
        <input name="companyName" defaultValue={job?.companyName} placeholder="Company Name" className="border p-2 rounded" required />
        <input name="jobTitle" defaultValue={job?.jobTitle} placeholder="Position" className="border p-2 rounded" required />
        <select name="status" defaultValue={statusValue} className="border p-2 rounded">
          <option value="WISHLIST">Wishlist</option>
          <option value="APPLIED">Applied</option>
          <option value="INTERVIEWING">Interviewing</option>
          <option value="OFFER">Offer</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <input name="salaryRange" defaultValue={job?.salaryRange || ''} placeholder="Salary Range" className="border p-2 rounded" />
        <textarea name="notes" defaultValue={job?.notes || ''} placeholder="Notes" className="border p-2 rounded" />
        
        <div className="flex">
          <button type="submit" className="button-primary w-full">
            {job ? 'Update Job' : 'Add Job'}
          </button>
        </div>
      </form>
    </div>
  );
}
