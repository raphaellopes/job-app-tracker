import classNames from "classnames";

import Badge, { type BadgeProps } from "@/components/badge";

import type { JobStatusType } from "@/db/schema";

import { getStatusColor } from "@/utils/status-colors";
import { getStatusLabel } from "@/utils/status-labels";

interface JobStatusTagProps extends BadgeProps {
  status: JobStatusType;
}

const JobStatusTag: React.FC<JobStatusTagProps> = ({ status, className, ...props }) => {
  const statusColor = getStatusColor(status);
  return (
    <Badge className={classNames(statusColor.bg, statusColor.text, className)} {...props}>
      {getStatusLabel(status)}
    </Badge>
  );
};

export default JobStatusTag;
