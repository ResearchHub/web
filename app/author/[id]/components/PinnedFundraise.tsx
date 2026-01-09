'use client';

import { FC } from 'react';
import { useFeed } from '@/hooks/useFeed';
import { ID } from '@/types/root';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import { useFeedItemAnalyticsTracking } from '@/hooks/useFeedItemAnalyticsTracking';
import { cn } from '@/utils/styles';

export function PinnedFundraiseSkeleton({ className }: { className?: string }) {
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

interface PinnedFundraiseProps {
  userId: ID;
  className?: string;
  showTitle?: boolean;
  showActions?: boolean;
  compact?: boolean;
}

/**
 * Helper function to get the most funded pinned fundraise
 * Sorting by amount raised (highest first) and returning the top one
 */
const getMostFundedFundraise = (entries: any[]) => {
  if (!entries || entries.length === 0) return null;

  // Sort by amount raised (highest first) and return the first one
  const sorted = entries.sort((a, b) => {
    const aRaised = a.raw?.content_object?.fundraise?.amount_raised?.rsc || 0;
    const bRaised = b.raw?.content_object?.fundraise?.amount_raised?.rsc || 0;
    return bRaised - aRaised;
  });

  return sorted[0];
};

const PinnedFundraise: FC<PinnedFundraiseProps> = ({
  userId,
  className,
  showTitle = true,
  showActions = true,
  compact = false,
}) => {
  const { entries, isLoading } = useFeed('open', {
    endpoint: 'funding_feed',
    contentType: 'PREREGISTRATION',
    fundraiseStatus: 'OPEN',
    createdBy: Number(userId),
  });

  const mostFundedFundraise = getMostFundedFundraise(entries);

  const { handleFeedItemClick } = useFeedItemAnalyticsTracking({
    entry: mostFundedFundraise,
  });

  if (isLoading) {
    return <PinnedFundraiseSkeleton className={className} />;
  }

  if (!entries || entries.length === 0) {
    return null;
  }

  if (!mostFundedFundraise) {
    return null;
  }

  return (
    <div className={cn('relative', className)}>
      {/* Use FeedItemFundraise for rendering with pinned fundraise indicator */}
      <FeedItemFundraise
        entry={mostFundedFundraise}
        showActions={showActions}
        maxLength={compact ? 150 : 250}
        customActionText="is seeking funding"
        isPinnedFundraise={true}
        onFeedItemClick={handleFeedItemClick}
      />
    </div>
  );
};

export default PinnedFundraise;
