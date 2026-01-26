'use client';

import Link from 'next/link';
import { Job } from '@/db/schema';
import { getStatusColor } from '@/utils/status-colors';

interface RecentJobsTableProps {
  jobs: Array<Job>;
}

function formatDate(date: string | null): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(dateObj);
  } catch {
    return 'N/A';
  }
}

export function RecentJobsTable({ jobs }: RecentJobsTableProps) {
  if (jobs.length === 0) {
    return (
      <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Jobs</h2>
        <div className="text-center py-8">
          <p className="text-gray-500">No recent jobs to display</p>
        </div>
        <div className="mt-4">
          <Link
            href="/board"
            className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
          >
            View All →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Jobs</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Job Title</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company Name</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => {
              const statusColors = getStatusColor(job.status);
              
              return (
                <tr
                  key={job.id}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">{job.jobTitle}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{job.companyName}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text} bg-opacity-10`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDate(job.appliedDate)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-right">
        <Link
          href="/board"
          className="inline-block text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
        >
          View All →
        </Link>
      </div>
    </div>
  );
}
