'use client';

import { FC, useMemo } from 'react';
import Link from 'next/link';
import { ArrowRight, Calendar, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';
import { Fundraise } from '@/types/funding';
import { AuthorProfile } from '@/types/authorProfile';
import { FundraiseCard } from './FundraiseCard';
import { cn } from '@/utils/styles';
import { Search, Target } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { Grant } from '@/types/grant';

type FundraiseWithDetails = Fundraise & {
  title: string;
  description: string;
  authors: AuthorProfile[];
  previewImage?: string;
  grantId: number;
};

interface FundraiseGridProps {
  fundraises: FundraiseWithDetails[];
  grantTitles?: Record<number, string>;
  showGrantBadge?: boolean;
  isLoading?: boolean;
  className?: string;
  // Opportunity selector props
  grants?: Grant[];
  selectedGrant?: Grant | null;
  selectedGrantId?: number | null;
  onSelectGrant?: (grantId: number | null) => void;
  fundraiseCounts?: Record<number, number>;
  totalFundraiseCount?: number;
}

// ─── Loading Skeleton ────────────────────────────────────────────────────
const GridSkeleton: FC = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse"
      >
        {/* Image skeleton */}
        <div className="aspect-[16/10] bg-gray-100" />

        {/* Content skeleton */}
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-gray-100 rounded-full" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="space-y-2">
            <div className="h-5 bg-gray-100 rounded w-3/4" />
            <div className="h-5 bg-gray-100 rounded w-1/2" />
          </div>
          <div className="pt-4 border-t border-gray-50 space-y-3">
            <div className="flex justify-between">
              <div className="h-4 bg-gray-100 rounded w-16" />
              <div className="h-4 bg-gray-100 rounded w-16" />
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full w-full" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-50 rounded w-20" />
              <div className="h-3 bg-gray-50 rounded w-12" />
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────
interface EmptyStateProps {
  hasFilter?: boolean;
}

const EmptyState: FC<EmptyStateProps> = ({ hasFilter }) => (
  <div className="py-20 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
    <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gray-50 flex items-center justify-center text-gray-300">
      {hasFilter ? <Search size={32} /> : <Target size={32} />}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">
      {hasFilter ? 'No proposals found' : 'No proposals yet'}
    </h3>
    <p className="text-gray-500 max-w-sm mx-auto font-medium">
      {hasFilter
        ? 'Try selecting a different funding opportunity or clear your current filters.'
        : 'Be the first to submit a proposal for this funding opportunity!'}
    </p>
  </div>
);

// ─── Helpers ─────────────────────────────────────────────────────────────
const formatAmount = (amount: number) => {
  if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${(amount / 1000).toFixed(0)}K`;
  return amount.toLocaleString();
};

// ─── Opportunity Selector Card (spans 2 columns, includes carousel) ──────
interface OpportunitySelectorCardProps {
  grants: Grant[];
  selectedGrant: Grant | null;
  selectedGrantId: number | null;
  onSelectGrant: (grantId: number | null) => void;
  fundraiseCounts: Record<number, number>;
  totalFundraiseCount: number;
}

const OpportunitySelectorCard: FC<OpportunitySelectorCardProps> = ({
  grants,
  selectedGrant,
  selectedGrantId,
  onSelectGrant,
  fundraiseCounts,
  totalFundraiseCount,
}) => {
  const { showUSD } = useCurrencyPreference();

  // Find current index for navigation
  const currentIndex = useMemo(() => {
    if (selectedGrantId === null) return -1;
    return grants.findIndex((g) => g.id === selectedGrantId);
  }, [grants, selectedGrantId]);

  const canGoPrev = currentIndex > 0 || (currentIndex === -1 && grants.length > 0);
  const canGoNext = currentIndex < grants.length - 1;

  const handlePrev = () => {
    if (currentIndex === -1) return;
    if (currentIndex === 0) {
      onSelectGrant(null); // Go to "All"
    } else {
      const prevGrant = grants[currentIndex - 1];
      if (typeof prevGrant.id === 'number') {
        onSelectGrant(prevGrant.id);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex === -1) {
      // Currently on "All", go to first grant
      const firstGrant = grants[0];
      if (firstGrant && typeof firstGrant.id === 'number') {
        onSelectGrant(firstGrant.id);
      }
    } else if (currentIndex < grants.length - 1) {
      const nextGrant = grants[currentIndex + 1];
      if (typeof nextGrant.id === 'number') {
        onSelectGrant(nextGrant.id);
      }
    }
  };

  // If no grant is selected, show "All Opportunities" state
  if (!selectedGrant) {
    return (
      <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 overflow-hidden relative">
        <div className="relative p-5 flex flex-col h-full">
          {/* Header with navigation */}
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                <Target size={16} className="text-gray-500" />
              </div>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                All Opportunities
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1.5 rounded-lg bg-gray-100 text-gray-300 cursor-not-allowed"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={grants.length === 0}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  grants.length > 0
                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                )}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-grow">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Browsing All Opportunities
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {totalFundraiseCount} proposals across {grants.length} funding opportunities.
              Select an opportunity to filter proposals.
            </p>
          </div>

          {/* Mini grant pills */}
          <div className="flex flex-wrap gap-2 mt-auto">
            {grants.slice(0, 4).map((grant) => {
              const count = typeof grant.id === 'number' ? fundraiseCounts[grant.id] || 0 : 0;
              return (
                <button
                  key={grant.id}
                  onClick={() => typeof grant.id === 'number' && onSelectGrant(grant.id)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-full hover:border-primary-300 hover:bg-primary-50 transition-colors truncate max-w-[180px]"
                >
                  {grant.title} ({count})
                </button>
              );
            })}
            {grants.length > 4 && (
              <span className="px-3 py-1.5 text-xs text-gray-400">
                +{grants.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Selected grant view
  const amount = showUSD
    ? `$${formatAmount(selectedGrant.amount.usd)}`
    : `${formatAmount(selectedGrant.amount.rsc)} RSC`;

  return (
    <div className="col-span-1 sm:col-span-2 bg-gradient-to-br from-primary-50 to-white rounded-xl border border-primary-200 overflow-hidden relative group">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-primary-100 rounded-full translate-x-1/3 -translate-y-1/3 blur-2xl opacity-60 pointer-events-none" />

      <div className="relative p-5 flex flex-col h-full">
        {/* Header with navigation */}
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
              <Target size={16} className="text-primary-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-primary-600 uppercase tracking-wide">
                Funding Opportunity
              </span>
              <span className="text-[10px] text-gray-400">
                {currentIndex + 1} of {grants.length}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectGrant(null)}
              className="px-2.5 py-1 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              View All
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrev}
                disabled={!canGoPrev}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  canGoPrev
                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                )}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                disabled={!canGoNext}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  canGoNext
                    ? 'bg-primary-100 text-primary-600 hover:bg-primary-200'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                )}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Title & Org */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 mb-1 group-hover:text-primary-700 transition-colors">
            {selectedGrant.title}
          </h3>
          <p className="text-sm text-gray-500">{selectedGrant.organization}</p>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-grow">
          {selectedGrant.description}
        </p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm mb-4">
          <div className="flex items-center gap-1.5 text-green-600">
            <DollarSign size={14} />
            <span className="font-semibold">{amount}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <div className="flex items-center gap-1.5 text-gray-600">
            <Calendar size={14} />
            <span>{formatDeadline(selectedGrant.endDate)}</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-gray-300" />
          <span
            className={cn(
              'px-2 py-0.5 text-xs font-medium rounded-full',
              selectedGrant.status === 'OPEN'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            )}
          >
            {selectedGrant.status === 'OPEN' ? 'Open' : selectedGrant.status}
          </span>
        </div>

        {/* CTA */}
        <Link
          href={`/fund/new?grant=${selectedGrant.id}`}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-all group/btn"
        >
          <span>Apply for this Grant</span>
          <ArrowRight size={16} className="transition-transform group-hover/btn:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
};

// ─── Main Component ──────────────────────────────────────────────────────
export const FundraiseGrid: FC<FundraiseGridProps> = ({
  fundraises,
  grantTitles,
  showGrantBadge = false,
  isLoading = false,
  className,
  grants = [],
  selectedGrant,
  selectedGrantId = null,
  onSelectGrant,
  fundraiseCounts = {},
  totalFundraiseCount = 0,
}) => {
  if (isLoading) {
    return <GridSkeleton />;
  }

  // Show opportunity selector if we have grants and a selection handler
  const showOpportunitySelector = grants.length > 0 && onSelectGrant;

  if (fundraises.length === 0 && !showOpportunitySelector) {
    return <EmptyState hasFilter={showGrantBadge} />;
  }

  // Layout: [opportunity selector (2 cols)] [proposal]
  //         [proposal] [proposal] [proposal]

  return (
    <div
      className={cn(
        // Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {/* Opportunity selector card - spans 2 columns */}
      {showOpportunitySelector && (
        <OpportunitySelectorCard
          grants={grants}
          selectedGrant={selectedGrant ?? null}
          selectedGrantId={selectedGrantId}
          onSelectGrant={onSelectGrant}
          fundraiseCounts={fundraiseCounts}
          totalFundraiseCount={totalFundraiseCount}
        />
      )}

      {/* Proposal cards */}
      {fundraises.map((fundraise) => (
        <FundraiseCard
          key={fundraise.id}
          fundraise={fundraise}
          grantTitle={showGrantBadge && grantTitles ? grantTitles[fundraise.grantId] : undefined}
        />
      ))}

      {/* Empty state when showing selector but no proposals */}
      {showOpportunitySelector && fundraises.length === 0 && (
        <div className="col-span-1 py-12 text-center bg-white rounded-xl border border-gray-100">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center text-gray-300">
            <Target size={24} />
          </div>
          <h4 className="text-sm font-semibold text-gray-900 mb-1">No proposals yet</h4>
          <p className="text-xs text-gray-500">Be the first to apply!</p>
        </div>
      )}
    </div>
  );
};

// ─── Grid Header Component ───────────────────────────────────────────────
interface GridHeaderProps {
  count: number;
  selectedGrantTitle?: string | null;
  sortBy?: string;
  onSortChange?: (sort: string) => void;
}

export const FundraiseGridHeader: FC<GridHeaderProps> = ({ count, selectedGrantTitle }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Proposals</h2>
        <span className="text-sm font-medium text-gray-400">({count})</span>
      </div>
      <p className="text-sm text-gray-500 mt-1.5">
        {selectedGrantTitle
          ? `Competing for "${selectedGrantTitle}"`
          : 'Proposals competing for the funding opportunities above'}
      </p>
    </div>
  );
};
