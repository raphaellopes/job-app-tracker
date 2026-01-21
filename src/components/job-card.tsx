import Link from 'next/link';
import { Job } from '@/db/schema';
import { DeleteJobButton } from '@/components/delete-job-button';
import { EditIcon } from '@/components/icons/edit-icon';

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="border p-4 rounded-lg shadow-sm bg-white group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">{job.companyName}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 bg-gray-100 rounded-full text-gray-400">
            {job.status}
          </span>
          <Link href={`/board?edit=${job.id}`} className="hidden group-hover:block text-gray-400 hover:text-blue-500 transition-colors">
            <EditIcon className="w-4 h-4" />
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
