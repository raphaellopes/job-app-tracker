"use client";

import Card from "@/components/card";

interface SuccessMetricsCardProps {
  pipelineTotal: number;
  offerCount: number;
  interviewingCount: number;
}

const SuccessMetricsCard: React.FC<SuccessMetricsCardProps> = ({
  pipelineTotal,
  offerCount,
  interviewingCount,
}) => {
  // Calculate offer rate, handling division by zero
  const offerRate = pipelineTotal > 0 ? (offerCount / pipelineTotal) * 100 : 0;
  const offerRateFormatted = offerRate.toFixed(1);

  // Calculate interview pipeline percentage, handling division by zero
  const interviewPipelinePercent =
    pipelineTotal > 0 ? (interviewingCount / pipelineTotal) * 100 : 0;

  return (
    <div className="border border-gray-200 rounded-lg shadow-sm bg-white p-6">
      <div className="flex justify-between items-baseline mb-6">
        <div>
          <p className="text-sm text-gray-600 mb-1">Total Pipeline</p>
          <p className="text-4xl font-bold text-gray-900">{pipelineTotal}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600 mb-1">Offer Rate</p>
          <p className="text-3xl font-bold text-blue-700">{offerRateFormatted}%</p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Interviews Pipeline</p>
          <p className="text-sm text-gray-600">{interviewPipelinePercent.toFixed(1)}%</p>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="bg-blue-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(interviewPipelinePercent, 100)}%` }}
          />
        </div>
      </div>

      <Card variant="primary">
        <span className="font-semibold">Tip:</span> Roles in the "Interviewing" stage have the
        highest priority for prep. Focus on these to increase your offer rate.
      </Card>
    </div>
  );
};

export default SuccessMetricsCard;
