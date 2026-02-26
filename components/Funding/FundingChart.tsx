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
import { formatMonthForChart } from '@/app/funding/dashboard/lib/dashboardUtils';
import { FundingPoint } from '@/types/fundingImpactData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const formatTick = (value: number | string) =>
  +value >= 1000 ? `${+value / 1000}k` : String(value);

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
      ticks: { callback: formatTick },
    },
    y1: {
      beginAtZero: true,
      position: 'right' as const,
      grid: { display: false },
      ticks: { callback: formatTick },
    },
  },
};

interface FundingChartProps {
  readonly data: FundingPoint[];
}

export function FundingChart({ data }: FundingChartProps) {
  const chartData = useMemo(
    () => ({
      labels: data.map((point) => formatMonthForChart(point.month)),
      datasets: [
        {
          label: 'Your contributions',
          data: data.map((point) => point.userContributions),
          fill: 'origin' as const,
          backgroundColor: 'rgba(59, 130, 246, 0.4)',
          borderColor: 'rgb(59, 130, 246)',
          tension: 0.4,
          yAxisID: 'y',
        },
        {
          label: 'Matched by others',
          data: data.map((point) => point.matchedContributions),
          fill: 'origin' as const,
          backgroundColor: 'rgba(34, 197, 94, 0.3)',
          borderColor: 'rgb(34, 197, 94)',
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    }),
    [data]
  );

  return <Line data={chartData} options={CHART_OPTIONS} />;
}
