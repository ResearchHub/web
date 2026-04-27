'use client';

import { useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';

export const FUNDING_PILLS = [{ id: 'grants', label: 'Funding Opportunities' }];

export type FundingPillId = 'grants';

export function isFundingPill(id: string): id is FundingPillId {
  return id === 'grants';
}

interface ProfileFundingTabProps {
  /** User id of the profile being viewed. */
  userId: number;
}

/**
 * Funding tab — shows the user's funding opportunities (grants).
 */
export function ProfileFundingTab({ userId }: ProfileFundingTabProps) {
  const grantsOpts = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      createdBy: userId,
      ordering: 'newest',
    }),
    [userId]
  );

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', grantsOpts);

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No funding opportunities yet</p>
        </div>
      }
    />
  );
}
