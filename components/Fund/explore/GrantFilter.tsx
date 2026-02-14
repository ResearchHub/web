'use client';

import { FC, useMemo } from 'react';
import { Grant } from '@/types/grant';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Carousel, CarouselCard } from '@/components/ui/Carousel';

// ─── Helpers ─────────────────────────────────────────────────────────────

const formatAmount = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
};

// ─── Props ───────────────────────────────────────────────────────────────

interface GrantFilterProps {
  grants: Grant[];
  selectedGrantId: number | null;
  onSelectGrant: (grantId: number | null) => void;
  fundraiseCounts: Record<number, number>;
  totalFundraiseCount: number;
}

export const GrantFilter: FC<GrantFilterProps> = ({
  grants,
  selectedGrantId,
  onSelectGrant,
  fundraiseCounts,
  totalFundraiseCount,
}) => {
  const { showUSD } = useCurrencyPreference();

  const isAllSelected = selectedGrantId === null;

  const cards: CarouselCard[] = useMemo(() => {
    // "All" card
    const allCard: CarouselCard = {
      onClick: () => onSelectGrant(null),
      content: (
        <div className={cn(
          'h-full px-3.5 py-2 rounded-lg border transition-all duration-200 flex items-center',
          isAllSelected
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
        )}>
          <span className={cn(
            'font-medium text-sm whitespace-nowrap',
            isAllSelected ? 'text-primary-700' : 'text-gray-800',
          )}>
            All Opportunities
          </span>
        </div>
      ),
    };

    // Individual grant cards
    const grantCards: CarouselCard[] = grants.map((grant) => {
      const isSelected = selectedGrantId === grant.id;
      const amount = showUSD
        ? `$${formatAmount(grant.amount.usd)}`
        : `${formatAmount(grant.amount.rsc)} RSC`;

      return {
        onClick: () => onSelectGrant(grant.id),
        content: (
          <div className={cn(
            'h-full px-3.5 py-2 rounded-lg border transition-all duration-200',
            isSelected
              ? 'border-primary-500 bg-primary-50'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
          )}>
            <span className="block text-xs text-gray-400 whitespace-nowrap">
              {amount}
            </span>
            <span className={cn(
              'block font-medium text-sm leading-snug line-clamp-2 mt-0.5',
              isSelected ? 'text-primary-700' : 'text-gray-800',
            )}>
              {grant.title}
            </span>
          </div>
        ),
      };
    });

    return [allCard, ...grantCards];
  }, [grants, selectedGrantId, onSelectGrant, showUSD, isAllSelected]);

  return (
    <div className="w-full">
      {/* Section header — matches FundraiseGridHeader */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">
          Funding Opportunities
        </h2>
      </div>

      {/* Carousel with per-card selection styling baked into content */}
      <Carousel
        cards={cards}
        cardWidth="w-[280px]"
        gap="gap-2"
        showFadeGradient={true}
        cardClassName="!bg-transparent !p-0 !rounded-none"
      />
    </div>
  );
};
