'use client';

import { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { formatMonth } from '@/app/funding/dashboard/lib/dashboardUtils';
import { FundingPoint } from '@/types/impactData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const CHART_OPTIONS = {
  responsive: true,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { usePointStyle: true, pointStyle: 'circle' },
    },
  },
  scales: {
    x: { grid: { display: false } },
    y: {
      beginAtZero: true,
      grid: { display: false },
      ticks: {
        callback: (value: number | string) => (+value >= 1000 ? `${+value / 1000}k` : value),
      },
    },
  },
} as const;

interface FundingChartProps {
  data: FundingPoint[];
}

export function FundingChart({ data }: FundingChartProps) {
  const chartData = useMemo(
    () => ({
      labels: data.map((point) => formatMonth(point.month)),
      datasets: [
        {
          label: 'Your contributions',
          data: data.map((point) => point.userContributions),
          fill: 'origin' as const,
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4,
        },
        {
          label: 'Matched by others',
          data: data.map((point) => point.matchedContributions),
          fill: 'origin' as const,
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.4,
        },
      ],
    }),
    [data]
  );

  return (
    <section className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="font-semibold text-gray-900 mb-1">Funding over time</h3>
      <p className="text-sm text-gray-500 mb-4">
        Cumulative contributions and matching from other funders
      </p>
      <Line data={chartData} options={CHART_OPTIONS} />
    </section>
  );
}
