import Link from 'next/link';
import { Job } from '@/db/schema';
import { DeleteJobButton } from '@/components/delete-job-button';

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white group">
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
  );
}
