'use client';

import { useMemo } from 'react';
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
import { useStakingYieldHistory, useStakingYieldStats } from '@/hooks/useStakingYield';
import type {
  StakingYieldHistoryEntry,
  StakingYieldRange,
  StakingYieldStats,
} from '@/services/staking-yield.service';
import { PixelBackdrop } from './PixelBackdrop';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler);

const RANGE_OPTIONS: ReadonlyArray<{ value: StakingYieldRange; label: string }> = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'all', label: 'All' },
];

const TVL_BLUE = '#3971FF';
const YLD_GREEN = '#16a34a';

function formatCurrency(value: string | null | undefined): string {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(2)}`;
}

function formatRSCShort(value: string | null | undefined): string {
  if (value == null || value === '') return '-';
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return Math.round(num).toLocaleString();
}

function formatLastUpdated(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

interface StatRowProps {
  label: string;
  value: string;
  unit?: string;
  highlight?: boolean;
  loading?: boolean;
}

function StatRow({ label, value, unit, highlight, loading }: Readonly<StatRowProps>) {
  return (
    <div className="endowment-stat-row">
      <span className="endowment-stat-label">{label}</span>
      {loading ? (
        <span className="endowment-stat-skeleton" />
      ) : (
        <span className={`endowment-stat-value${highlight ? ' endowment-stat-value-amber' : ''}`}>
          {value}
          {unit ? <span className="endowment-stat-unit">{unit}</span> : null}
        </span>
      )}
    </div>
  );
}

function StatsList({ stats, isLoading }: { stats: StakingYieldStats | null; isLoading: boolean }) {
  const lastUpdated = formatLastUpdated(stats?.accrual_date);

  return (
    <div className="endowment-stat-list-card">
      <h3>Yield stats</h3>
      <div className="endowment-stat-sub">
        {lastUpdated ? `Snapshot · last updated ${lastUpdated}` : 'Snapshot · all participants'}
      </div>
      <StatRow
        label="Annualized yield"
        value={stats ? `${stats.apy.toFixed(2)}%` : '-'}
        highlight
        loading={isLoading}
      />
      <StatRow
        label="30-day avg yield"
        value={stats ? `${stats.apy_30d_avg.toFixed(2)}%` : '-'}
        loading={isLoading}
      />
      <StatRow
        label="Issued today (USD)"
        value={formatCurrency(stats?.issued_today_usd)}
        loading={isLoading}
      />
      <StatRow
        label="Issued today (RSC)"
        value={formatRSCShort(stats?.issued_today_rsc)}
        unit=" RSC"
        loading={isLoading}
      />
      <StatRow
        label="Holders earning"
        value={stats ? stats.holders.toLocaleString() : '-'}
        loading={isLoading}
      />
      <StatRow
        label="Total value locked"
        value={formatCurrency(stats?.total_value_locked_usd)}
        loading={isLoading}
      />
      <StatRow
        label="% of Supply in Endowments"
        value={stats ? `${stats.pct_of_supply_staked.toFixed(2)}%` : '-'}
        loading={isLoading}
      />
    </div>
  );
}

interface YieldChartProps {
  history: StakingYieldHistoryEntry[];
}

function InteractiveYieldChart({ history }: Readonly<YieldChartProps>) {
  const labels = history.map((r) =>
    new Date(r.accrual_date + 'T00:00:00').toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
  );

  const apyData = history.map((r) => r.apy);
  const tvlData = history.map((r) =>
    r.total_value_locked_usd != null ? parseFloat(r.total_value_locked_usd) : null
  );
  const hasTvl = tvlData.some((v) => v != null);

  const tvlFill = (context: any) => {
    const { ctx, chartArea } = context.chart;
    if (!chartArea) return undefined;
    const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
    gradient.addColorStop(0, 'rgba(57, 113, 255, 0.32)');
    gradient.addColorStop(1, 'rgba(57, 113, 255, 0.02)');
    return gradient;
  };

  const data = {
    labels,
    datasets: [
      ...(hasTvl
        ? [
            {
              label: 'TVL',
              data: tvlData,
              borderColor: TVL_BLUE,
              backgroundColor: tvlFill,
              fill: true,
              tension: 0.3,
              pointRadius: 0,
              pointHoverRadius: 5,
              pointHoverBackgroundColor: TVL_BLUE,
              pointHoverBorderColor: '#fff',
              pointHoverBorderWidth: 2,
              borderWidth: 2.6,
              yAxisID: 'y',
            },
          ]
        : []),
      {
        label: 'Supply yield',
        data: apyData,
        borderColor: YLD_GREEN,
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: YLD_GREEN,
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
        borderWidth: 2,
        borderDash: [5, 4],
        yAxisID: 'y1',
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
        backgroundColor: 'rgba(11, 21, 48, 0.95)',
        titleColor: '#fff',
        titleFont: { weight: 'bold' as const, size: 12 },
        bodyColor: '#dbeafe',
        bodyFont: { size: 12 },
        padding: 12,
        cornerRadius: 8,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        boxPadding: 6,
        callbacks: {
          label: (ctx: any) => {
            if (ctx.dataset.yAxisID === 'y1') {
              return `Supply yield: ${ctx.parsed.y.toFixed(2)}%`;
            }
            const val = ctx.parsed.y;
            if (val == null) return '';
            if (val >= 1_000_000) return `TVL: $${(val / 1_000_000).toFixed(2)}M`;
            if (val >= 1_000) return `TVL: $${(val / 1_000).toFixed(1)}K`;
            return `TVL: $${val.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          maxTicksLimit: 6,
          color: '#9ca3af',
          font: { size: 10 },
          padding: 2,
        },
      },
      y: {
        position: 'left' as const,
        beginAtZero: true,
        grid: { color: '#e5e7eb', drawBorder: false },
        border: { display: false },
        ticks: {
          maxTicksLimit: 4,
          callback: (value: any) => {
            const n = Number(value);
            if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
            if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
            return `$${n}`;
          },
          color: '#6b7280',
          font: { size: 10 },
          padding: 4,
        },
      },
      ...(hasTvl
        ? {
            y1: {
              position: 'right' as const,
              beginAtZero: true,
              grid: { display: false },
              border: { display: false },
              ticks: {
                maxTicksLimit: 4,
                callback: (value: any) => `${Math.round(Number(value))}%`,
                color: YLD_GREEN,
                font: { size: 10 },
                padding: 4,
              },
            },
          }
        : {}),
    },
    layout: { padding: { top: 4, right: 4, bottom: 0, left: 0 } },
  };

  return <Line data={data} options={options} />;
}

export function EndowmentStatsBand() {
  const { stats, isLoading: isStatsLoading } = useStakingYieldStats();
  const { history, isLoading: isHistoryLoading, range, setRange } = useStakingYieldHistory('90d');

  const summary = useMemo(() => {
    if (!history || history.results.length === 0) {
      return { lastTvl: null, lastYld: null, avgYld: null };
    }
    const apys = history.results.map((r) => r.apy);
    const avg = apys.reduce((a, b) => a + b, 0) / apys.length;
    const last = history.results[history.results.length - 1];
    return {
      lastTvl: last.total_value_locked_usd != null ? parseFloat(last.total_value_locked_usd) : null,
      lastYld: last.apy,
      avgYld: avg,
    };
  }, [history]);

  return (
    <section className="endowment-stats-band">
      <PixelBackdrop side="bottom-left" className="endowment-stats-pixel" />
      <PixelBackdrop side="bottom-right" className="endowment-stats-pixel" />
      <div className="endowment-stats-band-inner">
        <h2 className="endowment-stats-h2">
          Earn <span className="endowment-stats-h2-accent">daily yield</span> on your deposits.
        </h2>
        <p className="endowment-stats-sub">
          Funding credits distributed daily to users that hold RSC in their wallet.
        </p>
        <div className="endowment-stats-grid">
          <StatsList stats={stats} isLoading={isStatsLoading && !stats} />

          <div className="endowment-chart-card">
            <div className="endowment-chart-head">
              <h3>TVL &amp; supply yield</h3>
              <div className="endowment-range-bar">
                {RANGE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    className={range === opt.value ? 'on' : ''}
                    onClick={() => setRange(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="endowment-chart-area">
              {isHistoryLoading && (
                <div className="endowment-chart-loader">
                  <div className="endowment-chart-skeleton" />
                </div>
              )}
              {!isHistoryLoading && history && history.results.length > 0 && (
                <InteractiveYieldChart history={history.results} />
              )}
              {!isHistoryLoading && history && history.results.length === 0 && (
                <div className="endowment-chart-empty">No data available for this period</div>
              )}
            </div>

            <div className="endowment-chart-legend">
              <span className="endowment-legend-item">
                <span className="endowment-legend-dot" style={{ background: TVL_BLUE }} />
                TVL{' '}
                <b>
                  {summary.lastTvl != null ? `$${(summary.lastTvl / 1_000_000).toFixed(2)}M` : '-'}
                </b>
              </span>
              <span className="endowment-legend-item">
                <span
                  className="endowment-legend-dot endowment-legend-dot-dashed"
                  style={{ borderColor: YLD_GREEN }}
                />
                Supply yield{' '}
                <b>{summary.lastYld != null ? `${summary.lastYld.toFixed(0)}%` : '-'}</b>
                {summary.avgYld != null && (
                  <span className="endowment-legend-meta">
                    · {summary.avgYld.toFixed(0)}% avg ({range.toUpperCase()})
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .endowment-stats-band {
          position: relative;
          padding: 64px 28px;
          background: #dbeafe;
          color: #0b1530;
          overflow: hidden;
        }
        .endowment-stats-band-inner {
          position: relative;
          z-index: 2;
          max-width: 1280px;
          margin: 0 auto;
        }
        .endowment-stats-band :global(.endowment-stats-pixel) {
          z-index: 1;
        }
        .endowment-stats-h2 {
          font-family: 'Cal Sans', var(--font-geist-sans), system-ui, sans-serif;
          font-weight: 700;
          font-size: 42px;
          line-height: 1.1;
          letter-spacing: -0.022em;
          margin: 0 0 10px;
          color: #0b1530;
          text-align: center;
          text-wrap: balance;
        }
        .endowment-stats-h2-accent {
          background: linear-gradient(90deg, #fb923c, #f97316);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        .endowment-stats-sub {
          color: #1f2937;
          font-size: 16px;
          max-width: 640px;
          margin: 0 auto 32px;
          line-height: 1.55;
          text-align: center;
        }
        .endowment-stats-grid {
          display: grid;
          grid-template-columns: minmax(260px, 320px) minmax(0, 1fr);
          gap: 24px;
          align-items: stretch;
        }
        @media (max-width: 1100px) {
          .endowment-stats-grid {
            grid-template-columns: minmax(0, 1fr);
            gap: 24px;
          }
          .endowment-stats-h2 {
            font-size: 36px;
          }
        }
      `}</style>
      <style jsx global>{`
        .endowment-stat-list-card {
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 20px 22px;
          box-shadow: 0 16px 36px -20px rgba(13, 30, 80, 0.18);
          color: #0b1530;
        }
        .endowment-stat-list-card h3 {
          font-size: 13px;
          color: #6b7280;
          font-weight: 600;
          margin: 0 0 2px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .endowment-stat-sub {
          font-size: 12px;
          color: #9ca3af;
          margin-bottom: 12px;
        }
        .endowment-stat-row {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          gap: 12px;
          padding: 8px 0;
          border-bottom: 1px solid #eff4ff;
        }
        .endowment-stat-row:last-child {
          border-bottom: 0;
        }
        .endowment-stat-label {
          font-size: 13px;
          color: #4b5563;
          font-weight: 500;
          flex: 1;
          min-width: 0;
        }
        .endowment-stat-value {
          font-size: 17px;
          color: #0b1530;
          font-weight: 700;
          letter-spacing: -0.01em;
          font-variant-numeric: tabular-nums;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .endowment-stat-value-amber {
          color: #f97316;
        }
        .endowment-stat-unit {
          font-size: 12px;
          font-weight: 600;
          color: #9ca3af;
          margin-left: 3px;
        }
        .endowment-stat-skeleton {
          display: inline-block;
          width: 60px;
          height: 17px;
          border-radius: 6px;
          background: #eff4ff;
          animation: endowmentSkeletonPulse 1.4s ease-in-out infinite;
        }
        @keyframes endowmentSkeletonPulse {
          0%,
          100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
        .endowment-chart-card {
          background: #ffffff;
          border: 1px solid #bfdbfe;
          border-radius: 20px;
          padding: 18px 20px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 16px 36px -20px rgba(13, 30, 80, 0.18);
          color: #0b1530;
          width: 100%;
          min-width: 0;
        }
        .endowment-chart-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .endowment-chart-head h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0b1530;
        }
        .endowment-range-bar {
          display: inline-flex;
          padding: 3px;
          background: #f3f4f6;
          border-radius: 9999px;
          gap: 1px;
        }
        .endowment-range-bar button {
          padding: 6px 12px;
          border-radius: 9999px;
          border: 0;
          background: transparent;
          font-size: 12px;
          font-weight: 600;
          color: #4b5563;
          transition: all 0.18s;
          cursor: pointer;
        }
        .endowment-range-bar button.on {
          background: linear-gradient(90deg, #3971ff, #4a7fff);
          color: #fff;
          box-shadow: 0 2px 6px -2px rgba(57, 113, 255, 0.5);
        }
        .endowment-chart-area {
          position: relative;
          flex: 1;
          min-height: 180px;
          width: 100%;
        }
        .endowment-chart-loader,
        .endowment-chart-empty {
          height: 100%;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .endowment-chart-empty {
          color: #9ca3af;
          font-size: 14px;
        }
        .endowment-chart-skeleton {
          width: 100%;
          height: 100%;
          background: #f3f4f6;
          border-radius: 12px;
          animation: endowmentSkeletonPulse 1.4s ease-in-out infinite;
        }
        .endowment-chart-legend {
          margin-top: 10px;
          font-size: 12px;
          color: #6b7280;
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
        }
        .endowment-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }
        .endowment-legend-item b {
          color: #0b1530;
          font-weight: 700;
        }
        .endowment-legend-meta {
          color: #9ca3af;
        }
        .endowment-legend-dot {
          width: 10px;
          height: 10px;
          border-radius: 9999px;
          display: inline-block;
        }
        .endowment-legend-dot-dashed {
          width: 14px;
          height: 0;
          border-top: 2px dashed;
          border-radius: 0;
          background: transparent !important;
        }
      `}</style>
    </section>
  );
}
