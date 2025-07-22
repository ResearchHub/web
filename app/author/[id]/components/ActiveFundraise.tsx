'use client';

import { FC, useState, useEffect } from 'react';
import { useFundingFeed } from '@/hooks/useFundingFeed';
import { ID } from '@/types/root';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { cn } from '@/utils/styles';

export function ActiveFundraiseSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>
      <div className="overflow-hidden p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-3"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
}

interface ActiveFundraiseProps {
  authorId: ID;
  className?: string;
  showTitle?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Helper function to filter and sort active fundraises
 * Filters by status "OPEN" and sorts by amount raised
 */
const getActiveFundraises = (entries: any[]) => {
  if (!entries || entries.length === 0) return [];

  // Filter for OPEN status fundraises
  const openFundraises = entries.filter(
    (entry) => entry.raw?.content_object?.fundraise?.status === 'OPEN'
  );

  // Sort by amount raised (highest first)
  return openFundraises.sort((a, b) => {
    const aRaised = a.raw?.content_object?.fundraise?.amount_raised?.rsc || 0;
    const bRaised = b.raw?.content_object?.fundraise?.amount_raised?.rsc || 0;
    return bRaised - aRaised;
  });
};

const ActiveFundraise: FC<ActiveFundraiseProps> = ({
  authorId,
  className,
  showTitle = true,
  showActions = true,
  compact = false,
}) => {
  const { entries, isLoading, error, setSortBy } = useFundingFeed(100, undefined, Number(authorId));
  const [currentIndex, setCurrentIndex] = useState(0);

  // Set to 'open' view to match needs-funding page behavior
  useEffect(() => {
    setSortBy('open');
  }, [setSortBy]);

  if (isLoading) {
    return <ActiveFundraiseSkeleton className={className} />;
  }

  if (error || !entries || entries.length === 0) {
    return null;
  }

  const activeFundraises = getActiveFundraises(entries);

  if (activeFundraises.length === 0) {
    return null;
  }

  // Reset index if it's out of bounds
  if (currentIndex >= activeFundraises.length) {
    setCurrentIndex(0);
  }

  const currentEntry = activeFundraises[currentIndex];
  const hasMultiple = activeFundraises.length > 1;

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + activeFundraises.length) % activeFundraises.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeFundraises.length);
  };

  return (
    <div className={cn('relative', className)}>
      {/* Navigation Header for Multiple Fundraises */}
      {hasMultiple && (
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
            📌 Active fundraise
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
              {currentIndex + 1} of {activeFundraises.length}
            </span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrevious}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Previous fundraise"
            >
              <ChevronLeft className="w-4 h-4 text-gray-500" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Next fundraise"
            >
              <ChevronRight className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      )}

      {/* Use FeedItemFundraise for rendering */}
      <FeedItemFundraise
        entry={currentEntry}
        showActions={showActions}
        maxLength={compact ? 150 : 250}
        customActionText="is seeking funding"
      />
    </div>
  );
};

export default ActiveFundraise;
