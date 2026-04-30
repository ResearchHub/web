'use client';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Filler,
} from 'chart.js';
import { StakingYieldRange } from '@/services/staking-yield.service';
import { useStakingYieldHistory } from '@/hooks/useStakingYield';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const RANGE_OPTIONS: { value: StakingYieldRange; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'All' },
];

interface YieldChartProps {
  compact?: boolean;
  height?: number;
  defaultRange?: StakingYieldRange;
  showRangeSelector?: boolean;
  title?: string;
}

export function YieldChart({
  compact = false,
  height,
  defaultRange = '90d',
  showRangeSelector = true,
  title = 'Supply Yield',
}: Readonly<YieldChartProps>) {
  const { history, isLoading, range, setRange } = useStakingYieldHistory(defaultRange);

  const chartHeight = height ?? (compact ? 150 : 300);

  const labels =
    history?.results.map((r) =>
      new Date(r.accrual_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ) ?? [];

  const apyData = history?.results.map((r) => r.apy) ?? [];

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Yield',
        data: apyData,
        borderColor: '#3971ff',
        backgroundColor: 'rgba(57, 113, 255, 0.08)',
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: compact ? 2 : 4,
        borderWidth: compact ? 1.5 : 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        usePointStyle: true,
        callbacks: {
          label: (ctx: any) => `Yield: ${ctx.parsed.y.toFixed(2)}%`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: compact ? 4 : 8,
          color: '#9ca3af',
          font: { size: compact ? 10 : 11 },
        },
      },
      y: {
        beginAtZero: true,
        grid: { color: '#f3f4f6' },
        ticks: {
          callback: (value: any) => `${value}%`,
          color: '#9ca3af',
          font: { size: compact ? 10 : 11 },
        },
      },
    },
  };

  return (
    <div className={compact ? '' : 'bg-white rounded-lg border border-gray-200 p-6'}>
      {(!compact || title) && (
        <div className={`flex items-center justify-between ${compact ? 'mb-3' : 'mb-6'}`}>
          {title && (
            <h2
              className={
                compact
                  ? 'text-sm font-semibold text-gray-900'
                  : 'text-lg font-semibold text-gray-900'
              }
            >
              {title}
            </h2>
          )}
          {showRangeSelector && (
            <div className="flex gap-1">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRange(opt.value)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    range === opt.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ height: chartHeight }}>
        {isLoading && (
          <div className="h-full flex items-center justify-center">
            <div className="animate-pulse h-full w-full bg-gray-50 rounded" />
          </div>
        )}
        {!isLoading && history?.results.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-400 text-sm">
            No data available for this period
          </div>
        )}
        {!isLoading && history && history.results.length > 0 && (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
