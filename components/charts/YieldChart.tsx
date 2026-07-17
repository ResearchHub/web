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
import { useStakingYieldHistory, useStakingYieldStats } from '@/hooks/useStakingYield';
import { formatRSC } from '@/utils/number';

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
  /** Show numeric axis labels + grid. Defaults to true. */
  showAxes?: boolean;
  /** Use a top-to-bottom gradient fill instead of a flat opacity tint. */
  gradientFill?: boolean;
  /** Show summary stats (yield, total staked, tokens issued today) above the chart. */
  showStats?: boolean;
}

export function YieldChart({
  compact = false,
  height,
  defaultRange = '90d',
  showRangeSelector = true,
  title = 'Annualized Yield',
  showAxes = true,
  gradientFill = false,
  showStats = false,
}: Readonly<YieldChartProps>) {
  const { history, isLoading, range, setRange } = useStakingYieldHistory(defaultRange);
  const { stats, isLoading: isStatsLoading } = useStakingYieldStats();
  const chartHeight = height ?? (compact ? 150 : 300);

  const labels =
    history?.results.map((r) =>
      new Date(r.accrual_date + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
    ) ?? [];

  const apyData = history?.results.map((r) => r.apy) ?? [];
  const tvlData =
    history?.results.map((r) =>
      r.total_value_locked_usd ? parseFloat(r.total_value_locked_usd) : null
    ) ?? [];
  const latestApy = stats?.apy ?? (apyData.length ? apyData[apyData.length - 1] : null);

  const totalStakedRsc = stats ? parseFloat(stats.total_staked_rsc) : null;
  const issuedTodayRsc = stats?.issued_today_rsc ? parseFloat(stats.issued_today_rsc) : null;

  const yieldColor = '#3971ff';
  const tvlColor = '#10b981';
  const yieldFill = gradientFill
    ? (context: any) => {
        const { ctx, chartArea } = context.chart;
        if (!chartArea) return undefined;
        const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
        gradient.addColorStop(0, 'rgba(57, 113, 255, 0.28)');
        gradient.addColorStop(1, 'rgba(57, 113, 255, 0)');
        return gradient;
      }
    : 'rgba(57, 113, 255, 0.08)';

  const hasTvl = tvlData.some((v) => v != null);

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Yield',
        data: apyData,
        borderColor: yieldColor,
        backgroundColor: yieldFill,
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: compact ? 2 : 4,
        borderWidth: compact ? 1.5 : 2,
        yAxisID: 'y',
      },
      ...(hasTvl
        ? [
            {
              label: 'TVL',
              data: tvlData,
              borderColor: tvlColor,
              backgroundColor: 'transparent',
              fill: false,
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: compact ? 2 : 4,
              borderWidth: compact ? 1.5 : 2,
              borderDash: [4, 3],
              yAxisID: 'y1',
            },
          ]
        : []),
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
          label: (ctx: any) => {
            if (ctx.dataset.yAxisID === 'y1') {
              const val = ctx.parsed.y;
              if (val >= 1_000_000) return `TVL: $${(val / 1_000_000).toFixed(2)}m`;
              if (val >= 1_000) return `TVL: $${(val / 1_000).toFixed(1)}k`;
              return `TVL: $${val.toFixed(2)}`;
            }
            return `Yield: ${ctx.parsed.y.toFixed(2)}%`;
          },
        },
      },
    },
    scales: showAxes
      ? {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: compact ? 4 : 8,
              color: '#9ca3af',
              font: { size: compact ? 10 : 11 },
            },
          },
          y: {
            position: 'left' as const,
            beginAtZero: true,
            grid: { color: '#f3f4f6' },
            ticks: {
              callback: (value: any) => `${value}%`,
              color: '#9ca3af',
              font: { size: compact ? 10 : 11 },
            },
          },
          ...(hasTvl
            ? {
                y1: {
                  position: 'right' as const,
                  beginAtZero: true,
                  grid: { display: false },
                  ticks: {
                    callback: (value: any) => {
                      if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}m`;
                      if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
                      return `$${value}`;
                    },
                    color: '#9ca3af',
                    font: { size: compact ? 10 : 11 },
                  },
                },
              }
            : {}),
        }
      : {
          x: { display: false, grid: { display: false } },
          y: { display: false, beginAtZero: true, grid: { display: false } },
          ...(hasTvl
            ? { y1: { display: false, beginAtZero: true, grid: { display: false } } }
            : {}),
        },
  };

  return (
    <div
      className={
        compact
          ? ''
          : 'bg-white rounded-lg border border-gray-200 px-6 pt-4 pb-6 w-full flex flex-col'
      }
    >
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

      {!compact && hasTvl && (
        <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 rounded"
              style={{ backgroundColor: yieldColor }}
            />
            Yield
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-0.5 rounded border-t border-dashed"
              style={{ borderColor: tvlColor }}
            />
            TVL
          </span>
        </div>
      )}

      {showStats && (
        <div className="mb-3 space-y-1.5 text-xs">
          <StatLine
            label="Yield"
            value={latestApy != null ? `${latestApy.toFixed(1)}%` : null}
            isLoading={isStatsLoading && latestApy == null}
          />
          <StatLine
            label="Total Value Locked"
            value={
              totalStakedRsc != null
                ? `${formatRSC({ amount: totalStakedRsc, shorten: true })} RSC`
                : null
            }
            isLoading={isStatsLoading}
          />
          <StatLine
            label="Issued today"
            value={
              issuedTodayRsc != null
                ? `${formatRSC({ amount: issuedTodayRsc, shorten: true })} RSC`
                : null
            }
            isLoading={isStatsLoading}
          />
        </div>
      )}

      <div className={compact ? '' : 'flex-1'} style={{ height: chartHeight }}>
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

function StatLine({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | null;
  isLoading: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      {isLoading ? (
        <div className="h-3 w-20 bg-gray-100 animate-pulse rounded" />
      ) : (
        <span className="text-gray-900 font-medium">{value ?? '—'}</span>
      )}
    </div>
  );
}
