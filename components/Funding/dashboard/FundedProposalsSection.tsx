'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { SupportedProposal } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { Avatar } from '@/components/ui/Avatar';
import { buildWorkUrl } from '@/utils/url';
import { cn } from '@/utils/styles';

ChartJS.register(ArcElement, ChartTooltip);

const SLICE_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#10b981',
  '#f97316',
];

function getSliceColor(index: number): string {
  return SLICE_COLORS[index % SLICE_COLORS.length];
}

interface FundedProposalsSectionProps {
  proposals: SupportedProposal[];
  className?: string;
}

export const FundedProposalsSection: FC<FundedProposalsSectionProps> = ({
  proposals,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartRef = useRef<ChartJS<'doughnut'> | null>(null);

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

  const amounts = proposals.map((p) => (showUSD ? p.fundedAmount.usd : p.fundedAmount.rsc));
  const totalRsc = proposals.reduce((sum, p) => sum + p.fundedAmount.rsc, 0);
  const totalUsd = proposals.reduce((sum, p) => sum + p.fundedAmount.usd, 0);

  // Mirror the hovered legend/donut state onto the chart so hovering a row
  // highlights the matching slice (and vice-versa).
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;
    chart.setActiveElements(
      hoveredIndex !== null ? [{ datasetIndex: 0, index: hoveredIndex }] : []
    );
    chart.update();
  }, [hoveredIndex]);

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
        hoverOffset: 10,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '58%',
    animation: { duration: 300, easing: 'easeOutQuart' as const },
    plugins: {
      tooltip: { enabled: false },
      legend: { display: false },
    },
    onHover: (_event: ChartEvent, elements: ActiveElement[]) => {
      const newIndex = elements.length > 0 ? elements[0].index : null;
      setHoveredIndex((prev) => (prev === newIndex ? prev : newIndex));
    },
  };

  const centerAmount =
    hoveredIndex !== null
      ? fmt(proposals[hoveredIndex].fundedAmount.rsc, proposals[hoveredIndex].fundedAmount.usd)
      : fmt(totalRsc, totalUsd);

  return (
    <div className={className}>
      <div className="mb-4 flex items-baseline gap-2.5">
        <h2 className="text-lg font-semibold tracking-tight text-gray-900">Proposals funded</h2>
        {proposals.length > 0 && (
          <span className="text-xs text-gray-500">{proposals.length} total</span>
        )}
      </div>

      {proposals.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 tablet:grid-cols-[1fr_220px] tablet:items-center tablet:gap-8">
          {/* List */}
          <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white">
            {proposals.map((proposal, i) => (
              <ProposalRow
                key={proposal.id}
                proposal={proposal}
                color={getSliceColor(i)}
                amount={fmt(proposal.fundedAmount.rsc, proposal.fundedAmount.usd)}
                isHovered={hoveredIndex === i}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
          </div>

          {/* Donut */}
          <div className="relative mx-auto h-[200px] w-[200px]">
            <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
              <span className="text-lg font-semibold text-gray-900">{centerAmount}</span>
              <span className="mt-0.5 line-clamp-2 text-[11px] leading-tight text-gray-500">
                {hoveredIndex !== null ? proposals[hoveredIndex].title : 'Total funded'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
          <p className="text-sm text-gray-500">No proposals funded yet.</p>
        </div>
      )}
    </div>
  );
};

interface ProposalRowProps {
  proposal: SupportedProposal;
  color: string;
  amount: string;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

const ProposalRow: FC<ProposalRowProps> = ({
  proposal,
  color,
  amount,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}) => {
  const href = buildWorkUrl({
    id: proposal.id,
    contentType: 'preregistration',
    slug: proposal.slug,
  });

  return (
    <Link
      href={href}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={cn(
        'flex items-center gap-3 px-4 py-3 transition-colors first:rounded-t-xl last:rounded-b-xl',
        isHovered ? 'bg-gray-50' : 'hover:bg-gray-50'
      )}
    >
      <span
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden
      />
      <Avatar
        src={proposal.createdBy.authorProfile.profileImage}
        alt={proposal.createdBy.authorProfile.fullName}
        size="sm"
        disableTooltip
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-gray-900">{proposal.title}</div>
        <div className="truncate text-xs text-gray-500">
          {proposal.createdBy.authorProfile.fullName}
        </div>
      </div>
      <span className="flex-shrink-0 text-sm font-semibold text-gray-900">{amount}</span>
    </Link>
  );
};
