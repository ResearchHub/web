'use client';

import { useMemo, useState } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFeed } from '@/hooks/useFeed';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import type { GrantSortOption } from '@/components/Funding/lib/grantSortConfig';

interface ProfileFundingFeedProps {
  /** User id of the profile being viewed — used to scope the grant feed. */
  userId: number;
}

export function ProfileFundingFeed({ userId }: ProfileFundingFeedProps) {
  const [grantSort, setGrantSort] = useState<GrantSortOption>('newest');

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      ordering: grantSort,
      createdBy: userId,
    }),
    [grantSort, userId]
  );

  const {
    entries: grantEntries,
    isLoading: isGrantFeedLoading,
    hasMore: hasMoreGrants,
    loadMore: loadMoreGrants,
  } = useFeed('all', grantFeedOptions);

  return (
    <FeedContent
      entries={grantEntries}
      isLoading={isGrantFeedLoading}
      hasMore={hasMoreGrants}
      loadMore={loadMoreGrants}
      filters={<GrantSortAndFilters sortBy={grantSort} onSortChange={setGrantSort} />}
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
