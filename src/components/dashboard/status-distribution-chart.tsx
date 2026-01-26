'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { getStatusColor } from '@/utils/status-colors';

interface StatusDistributionChartProps {
  data: Array<{ status: string; count: number }>;
}

// Map Tailwind color classes to hex values for Recharts
const TAILWIND_COLORS: Record<string, string> = {
  'bg-purple-500': '#a855f7',
  'bg-blue-500': '#3b82f6',
  'bg-amber-500': '#f59e0b',
  'bg-green-500': '#22c55e',
  'bg-red-500': '#ef4444',
  'bg-gray-500': '#6b7280',
};

/**
 * Converts Tailwind color class to hex value for Recharts
 */
function getColorHex(status: string): string {
  const colorMapping = getStatusColor(status);
  return TAILWIND_COLORS[colorMapping.bg] || TAILWIND_COLORS['bg-gray-500'];
}

/**
 * Formats status name for display (capitalizes first letter, rest lowercase)
 */
function formatStatusName(status: string): string {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

/**
 * Custom label function for pie chart segments
 */
const renderCustomLabel = (entry: { status: string; count: number; percent: number }) => {
  const percent = (entry.percent * 100).toFixed(0);
  return <span>{`${formatStatusName(entry.status)}: ${entry.count} (${percent}%)`}</span>;
};

/**
 * Custom tooltip component
 */
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<any> }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-800">{formatStatusName(data.status)}</p>
        <p className="text-sm text-gray-600">
          Count: <span className="font-medium">{data.count}</span>
        </p>
        <p className="text-sm text-gray-600">
          Percentage: <span className="font-medium">{(data.percent * 100).toFixed(1)}%</span>
        </p>
      </div>
    );
  }
  return null;
};

export function StatusDistributionChart({ data }: StatusDistributionChartProps) {
  // Handle empty data gracefully
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">No data available</p>
      </div>
    );
  }

  // Filter out entries with zero count and prepare data for chart
  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      fill: getColorHex(item.status),
    }));

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-gray-500 text-sm">No jobs to display</p>
      </div>
    );
  }

  return (
    <div className="w-full h-64 md:h-80 lg:h-96">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => {
              const item = chartData.find((d) => d.status === value);
              return item ? formatStatusName(value) : value;
            }}
            wrapperStyle={{ paddingTop: '20px' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
