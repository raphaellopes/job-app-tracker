import type { JobStatusType } from "@/db/schema";

import { getStatusColor } from "@/utils/status-colors";
import { getStatusLabel } from "@/utils/status-labels";

interface JobStatusTagProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: JobStatusType;
}

const JobStatusTag: React.FC<JobStatusTagProps> = ({ status, ...props }) => {
  const statusColor = getStatusColor(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text} bg-opacity-10`}
      {...props}
    >
      {getStatusLabel(status)}
    </span>
  );
};

export default JobStatusTag;
