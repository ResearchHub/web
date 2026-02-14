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
  onClickOrganization?: (orgSlug: string) => void;
}

export const GrantFilter: FC<GrantFilterProps> = ({
  grants,
  selectedGrantId,
  onSelectGrant,
  fundraiseCounts,
  totalFundraiseCount,
  onClickOrganization,
}) => {
  const { showUSD } = useCurrencyPreference();

  const isAllSelected = selectedGrantId === null;

  const cards: CarouselCard[] = useMemo(() => {
    // "All Opportunities" card
    const allCard: CarouselCard = {
      onClick: () => onSelectGrant(null),
      content: (
        <div
          className={cn(
            'h-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
            isAllSelected
              ? 'border-primary-500 bg-primary-50/80 shadow-sm'
              : 'border-transparent bg-gray-50 hover:bg-gray-100'
          )}
        >
          <span
            className={cn(
              'block text-[10px] font-bold uppercase tracking-wider mb-1.5',
              isAllSelected ? 'text-primary-500' : 'text-gray-400'
            )}
          >
            Browse
          </span>
          <span
            className={cn(
              'block font-semibold text-sm leading-snug whitespace-nowrap',
              isAllSelected ? 'text-primary-700' : 'text-gray-800'
            )}
          >
            All Opportunities
          </span>
          <span
            className={cn(
              'block text-xs mt-1',
              isAllSelected ? 'text-primary-500' : 'text-gray-400'
            )}
          >
            {totalFundraiseCount} proposals
          </span>
        </div>
      ),
    };

    // Individual grant cards - filter out grants with invalid IDs
    const grantCards: CarouselCard[] = grants
      .filter((grant): grant is Grant & { id: number } => typeof grant.id === 'number')
      .map((grant) => {
      const isSelected = selectedGrantId === grant.id;
      const amount = showUSD
        ? `$${formatAmount(grant.amount.usd)}`
        : `${formatAmount(grant.amount.rsc)} RSC`;
      const count = fundraiseCounts[grant.id] || 0;

      return {
        onClick: () => onSelectGrant(grant.id),
        content: (
          <div
            className={cn(
              'h-full px-4 py-3 rounded-xl border-2 transition-all duration-200',
              isSelected
                ? 'border-primary-500 bg-primary-50/80 shadow-sm'
                : 'border-transparent bg-gray-50 hover:bg-gray-100'
            )}
          >
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span
                onClick={
                  onClickOrganization
                    ? (e) => {
                        e.stopPropagation();
                        const slug = grant.organization
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        onClickOrganization(slug);
                      }
                    : undefined
                }
                className={cn(
                  'text-[10px] font-bold uppercase tracking-wider truncate',
                  isSelected ? 'text-primary-500' : 'text-gray-400',
                  onClickOrganization && 'hover:text-primary-600 hover:underline cursor-pointer'
                )}
              >
                {grant.organization}
              </span>
              <span
                className={cn(
                  'text-[10px] font-bold whitespace-nowrap',
                  isSelected ? 'text-emerald-600' : 'text-emerald-500'
                )}
              >
                {amount}
              </span>
            </div>
            <span
              className={cn(
                'block font-semibold text-sm leading-snug line-clamp-2',
                isSelected ? 'text-primary-700' : 'text-gray-800'
              )}
            >
              {grant.title}
            </span>
          </div>
        ),
      };
    });

    return [allCard, ...grantCards];
  }, [
    grants,
    selectedGrantId,
    onSelectGrant,
    showUSD,
    isAllSelected,
    fundraiseCounts,
    totalFundraiseCount,
    onClickOrganization,
  ]);

  return (
    <Carousel
      cards={cards}
      cardWidth="w-[240px]"
      gap="gap-2"
      showFadeGradient={true}
      cardClassName="!bg-transparent !p-0 !rounded-none"
    />
  );
};
