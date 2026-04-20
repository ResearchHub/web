'use client';

import { useMemo } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';

interface ProfileProposalsFeedProps {
  /** User id of the profile being viewed — used to scope the proposal feed. */
  userId: number;
}

export function ProfileProposalsFeed({ userId }: ProfileProposalsFeedProps) {
  const proposalFeedOptions = useMemo(
    () => ({
      endpoint: 'funding_feed' as const,
      contentType: 'PREREGISTRATION',
      createdBy: userId,
      ordering: 'newest',
    }),
    [userId]
  );

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', proposalFeedOptions);

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
          <p className="text-gray-400 text-sm">No proposals yet</p>
        </div>
      }
    />
  );
}
