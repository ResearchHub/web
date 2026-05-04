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
import { FundingPoint } from '@/types/fundingImpactData';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const formatTick = (value: number | string) =>
  +value >= 1000 ? `${+value / 1000}k` : String(value);

function formatMonthForChart(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return new Date(+year, +month - 1).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

interface FundingChartProps {
  readonly data: FundingPoint[];
  /**
   * Stacked variant: match series stacks visually on top of "your funding"
   * via fill: '-1', single y-axis, design-spec colors (blue + indigo).
   * Default false preserves the original two-axis behavior used elsewhere.
   */
  readonly stacked?: boolean;
  /** Render chart.js's built-in legend. Default true. */
  readonly showLegend?: boolean;
}

export function FundingChart({ data, stacked = false, showLegend = true }: FundingChartProps) {
  const chartData = useMemo(() => {
    const labels = data.map((point) => formatMonthForChart(point.month));

    if (stacked) {
      return {
        labels,
        datasets: [
          {
            label: 'Your funding',
            data: data.map((point) => point.userContributions),
            fill: 'origin' as const,
            backgroundColor: 'rgba(37, 99, 235, 0.18)',
            borderColor: 'rgb(37, 99, 235)',
            borderWidth: 2.4,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 0,
          },
          {
            label: '+ Community match',
            data: data.map((point) => point.userContributions + point.matchedContributions),
            fill: '-1' as const,
            backgroundColor: 'rgba(165, 180, 252, 0.45)',
            borderColor: 'rgb(99, 102, 241)',
            borderWidth: 2,
            tension: 0.4,
            yAxisID: 'y',
            pointRadius: 0,
          },
        ],
      };
    }

    return {
      labels,
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
    };
  }, [data, stacked]);

  const options = useMemo(
    () => ({
      responsive: true,
      aspectRatio: stacked ? 2.4 : 2,
      plugins: {
        legend: {
          display: showLegend,
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
          display: !stacked,
        },
      },
    }),
    [stacked, showLegend]
  );

  return <Line data={chartData} options={options} />;
}
