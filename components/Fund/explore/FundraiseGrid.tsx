'use client';

import { FC } from 'react';
import { Fundraise } from '@/types/funding';
import { AuthorProfile } from '@/types/authorProfile';
import { FundraiseCard } from './FundraiseCard';
import { cn } from '@/utils/styles';
import { Search, Target } from 'lucide-react';

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

// ─── Main Component ──────────────────────────────────────────────────────
export const FundraiseGrid: FC<FundraiseGridProps> = ({
  fundraises,
  grantTitles,
  showGrantBadge = false,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <GridSkeleton />;
  }

  if (fundraises.length === 0) {
    return <EmptyState hasFilter={showGrantBadge} />;
  }

  return (
    <div
      className={cn(
        // Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
        className
      )}
    >
      {fundraises.map((fundraise) => (
        <FundraiseCard
          key={fundraise.id}
          fundraise={fundraise}
          grantTitle={showGrantBadge && grantTitles ? grantTitles[fundraise.grantId] : undefined}
        />
      ))}
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

export const FundraiseGridHeader: FC<GridHeaderProps> = ({ count }) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Active Proposals</h2>
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-2.5 py-1 rounded-full border border-primary-100">
          {count} Total
        </span>
      </div>
    </div>
  );
};
