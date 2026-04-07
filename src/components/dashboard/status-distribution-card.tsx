"use client";

import { StatusDistributionChart } from "./status-distribution-chart";

interface StatusDistributionCardProps {
  data: Array<{ status: string; count: number }>;
}

const StatusDistributionCard: React.FC<StatusDistributionCardProps> = ({ data }) => {
  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Status Distribution</h2>
      <StatusDistributionChart data={data} />
    </div>
  );
};

export default StatusDistributionCard;
