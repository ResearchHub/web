'use client';

import { StakingYieldStats } from '@/services/staking-yield.service';

function formatNumber(value: number): string {
  return value.toLocaleString('en-US');
}

function formatCurrency(value: string | null): string {
  if (!value) return '--';
  const num = Number(value);
  if (num >= 1_000_000) {
    return `$${(num / 1_000_000).toFixed(2)}m`;
  }
  if (num >= 1_000) {
    return `$${(num / 1_000).toFixed(1)}k`;
  }
  return `$${num.toFixed(2)}`;
}

function formatRSC(value: string): string {
  const num = Number(value);
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)}m`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1)}k`;
  }
  return formatNumber(Math.round(num));
}

interface StatRowProps {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatRow({ label, value, highlight }: StatRowProps) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-primary-500' : 'text-gray-900'}`}>
        {value}
      </span>
    </div>
  );
}

interface StatsPanelProps {
  stats: StakingYieldStats | null;
  isLoading: boolean;
}

function StatsSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex justify-between py-2.5">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-4 w-16 bg-gray-200 rounded" />
        </div>
      ))}
    </div>
  );
}

export function StatsPanel({ stats, isLoading }: StatsPanelProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">RSC Staking</h2>
        <StatsSkeleton />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-1">RSC Staking</h2>
      {stats.accrual_date && (
        <p className="text-xs text-gray-400 mb-4">
          Last updated{' '}
          {new Date(stats.accrual_date + 'T00:00:00').toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
      )}
      <StatRow label="APY" value={`${stats.apy.toFixed(2)}%`} highlight />
      <StatRow label="30d Avg APY" value={`${stats.apy_30d_avg.toFixed(2)}%`} />
      <StatRow label="Holders" value={formatNumber(stats.holders)} />
      <StatRow label="Top 10%" value={`${stats.top_10_concentration_pct.toFixed(1)}%`} />
      <StatRow label="Total Staked" value={`${formatRSC(stats.total_staked_rsc)} RSC`} />
      <StatRow label="Total Value Locked" value={formatCurrency(stats.total_value_locked_usd)} />
      <StatRow label="% of Supply Staked" value={`${stats.pct_of_supply_staked.toFixed(2)}%`} />
    </div>
  );
}
