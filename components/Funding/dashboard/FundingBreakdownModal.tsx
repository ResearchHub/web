'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  ChartEvent,
  ActiveElement,
} from 'chart.js';
import { BaseModal } from '@/components/ui/BaseModal';
import { FunderOverview } from '@/types/funder';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

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

interface FundingBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  overview: FunderOverview;
}

export const FundingBreakdownModal: FC<FundingBreakdownModalProps> = ({
  isOpen,
  onClose,
  overview,
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

  const proposals = overview.supportedProposals;
  const amounts = proposals.map((p) => (showUSD ? p.fundedAmount.usd : p.fundedAmount.rsc));

  // Programmatically highlight the hovered segment when triggered from legend rows
  useEffect(() => {
    const chart = chartRef.current;
    if (!chart) return;

    if (hoveredIndex !== null) {
      chart.setActiveElements([{ datasetIndex: 0, index: hoveredIndex }]);
    } else {
      chart.setActiveElements([]);
    }
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
        hoverOffset: 12,
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
      : fmt(overview.totalGiven.rsc, overview.totalGiven.usd);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Funding breakdown" size="lg">
      {proposals.length > 0 ? (
        <div className="relative mx-auto w-[200px] h-[200px]">
          <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-lg font-semibold text-gray-900">{centerAmount}</span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 text-center py-8">No proposals funded yet.</p>
      )}
    </BaseModal>
  );
};
