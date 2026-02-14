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
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
    {[...Array(6)].map((_, i) => (
      <div
        key={i}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse"
      >
        {/* Image skeleton */}
        <div className="aspect-[16/9] bg-gray-200" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-3/4" />
          <div className="space-y-1.5">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-2/3" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded-full" />
            <div className="h-3 bg-gray-100 rounded w-20" />
          </div>
          <div className="pt-2 space-y-2">
            <div className="h-2 bg-gray-200 rounded-full w-full" />
            <div className="flex justify-between">
              <div className="h-3 bg-gray-100 rounded w-24" />
              <div className="h-3 bg-gray-100 rounded w-16" />
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
  <div className="py-16 text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
      {hasFilter ? (
        <Search size={28} className="text-gray-400" />
      ) : (
        <Target size={28} className="text-gray-400" />
      )}
    </div>
    <h3 className="text-lg font-semibold text-gray-800 mb-2">
      {hasFilter ? 'No proposals found' : 'No proposals yet'}
    </h3>
    <p className="text-sm text-gray-500 max-w-md mx-auto">
      {hasFilter
        ? 'Try selecting a different funding opportunity or clear your filters.'
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
    <div className={cn(
      // Responsive grid: 1 col on mobile, 2 on tablet, 3 on desktop
      'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6',
      className
    )}>
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

export const FundraiseGridHeader: FC<GridHeaderProps> = ({
  count,
  selectedGrantTitle,
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {selectedGrantTitle ? 'Proposals' : 'All Proposals'}
        </h2>
        <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      
      {/* Future: Add sort dropdown here */}
      {/* <div className="flex items-center gap-2">
        <select className="text-sm border border-gray-200 rounded-lg px-2 py-1">
          <option value="newest">Newest</option>
          <option value="most-funded">Most Funded</option>
          <option value="ending-soon">Ending Soon</option>
        </select>
      </div> */}
    </div>
  );
};
