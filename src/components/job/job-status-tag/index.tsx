import { JobStatusType } from "@/db/schema";

import { formatStatusName } from "@/utils/format-status-name";
import { getStatusColor } from "@/utils/status-colors";

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
      {formatStatusName(status)}
    </span>
  );
};

export default JobStatusTag;
