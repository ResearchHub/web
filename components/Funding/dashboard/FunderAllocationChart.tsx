'use client';

import { FC, useCallback, useRef, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { FunderOverview, SupportedProposal } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/utils/styles';

ChartJS.register(ArcElement, ChartTooltip);

const SLICE_COLORS = [
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#14b8a6', // teal-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#ec4899', // pink-500
  '#10b981', // emerald-500
  '#f97316', // orange-500
];

function getSliceColor(index: number): string {
  return SLICE_COLORS[index % SLICE_COLORS.length];
}

interface FunderAllocationChartProps {
  overview: FunderOverview;
  className?: string;
}

export const FunderAllocationChart: FC<FunderAllocationChartProps> = ({ overview, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<'pie'> | null>(null);

  const fmt = useCallback(
    (rsc: number, usd: number) =>
      formatCurrency({
        amount: showUSD ? usd : rsc,
        showUSD,
        exchangeRate,
        shorten: true,
        skipConversion: true,
      }),
    [showUSD, exchangeRate]
  );

  const proposals = overview.supportedProposals;
  const amounts = proposals.map((p) => (showUSD ? p.fundedAmount.usd : p.fundedAmount.rsc));
  const total = amounts.reduce((sum, a) => sum + a, 0);

  const chartData = {
    labels: proposals.map((p) => p.title),
    datasets: [
      {
        data: amounts,
        backgroundColor: proposals.map((_, i) => getSliceColor(i)),
        hoverBackgroundColor: proposals.map((_, i) => getSliceColor(i)),
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverBorderColor: '#ffffff',
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
      setHoveredIndex(elements.length > 0 ? elements[0].index : null);
    },
  };

  return (
    <section
      className={cn(
        'relative overflow-hidden rounded-xl border border-gray-200 bg-white px-5 py-5 tablet:py-6 tablet:px-7 shadow-sm',
        className
      )}
      aria-label="Funding allocation"
    >
      <div className="grid grid-cols-1 gap-6 tablet:grid-cols-[240px_1fr] tablet:gap-8">
        {/* Left — Pie chart */}
        <div className="mx-auto w-[200px] h-[200px] tablet:w-[240px] tablet:h-[240px]">
          <Pie ref={chartRef} data={chartData} options={chartOptions} />
        </div>

        {/* Right — Metrics + Legend */}
        <div className="flex flex-col justify-between">
          {/* Key metrics */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <MetricCard
              label="You have given"
              value={fmt(overview.totalGiven.rsc, overview.totalGiven.usd)}
            />
            <MetricCard
              label="Community match"
              value={fmt(overview.communityMatch.rsc, overview.communityMatch.usd)}
            />
            <MetricCard
              label="Total deployed"
              value={fmt(overview.totalDeployed.rsc, overview.totalDeployed.usd)}
            />
            <MetricCard label="Match ratio" value={overview.matchRatio} />
          </div>

          {/* Proposal legend */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
              Proposals funded
            </div>
            <div className="space-y-2 max-h-[140px] overflow-y-auto">
              {proposals.map((proposal, i) => (
                <LegendRow
                  key={proposal.id}
                  proposal={proposal}
                  color={getSliceColor(i)}
                  amount={fmt(proposal.fundedAmount.rsc, proposal.fundedAmount.usd)}
                  percentage={total > 0 ? Math.round((amounts[i] / total) * 100) : 0}
                  isHovered={hoveredIndex === i}
                  onMouseEnter={() => setHoveredIndex(i)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricCard: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] text-gray-500 uppercase tracking-wider">{label}</div>
    <div className="text-lg font-semibold tracking-tight text-gray-900 mt-0.5">{value}</div>
  </div>
);

interface LegendRowProps {
  proposal: SupportedProposal;
  color: string;
  amount: string;
  percentage: number;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const LegendRow: FC<LegendRowProps> = ({
  proposal,
  color,
  amount,
  percentage,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}) => (
  <div
    className={cn(
      'flex items-center gap-2.5 px-2 py-1.5 rounded-lg transition-all cursor-default',
      isHovered ? 'bg-indigo-50 ring-1 ring-indigo-200' : 'hover:bg-gray-50'
    )}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
  >
    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
    <Avatar
      src={proposal.createdBy.authorProfile.profileImage}
      alt={proposal.createdBy.authorProfile.fullName}
      size="xs"
      disableTooltip
      className="flex-shrink-0"
    />
    <div className="min-w-0 flex-1">
      <div className="text-sm text-gray-900 truncate">{proposal.title}</div>
    </div>
    <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-sm font-medium text-gray-900">{amount}</span>
      <span className="text-xs text-gray-400">{percentage}%</span>
    </div>
  </div>
);
