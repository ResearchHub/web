'use client';

import { useMemo, useState } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { useFeed } from '@/hooks/useFeed';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { EarnSectionCards } from '@/components/Funding/EarnSectionCards';
import type { GrantSortOption } from '@/components/Funding/lib/grantSortConfig';

export function EarnPageContent() {
  const [grantSort, setGrantSort] = useState<GrantSortOption>('newest');

  const grantFeedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      ordering: grantSort,
    }),
    [grantSort]
  );

  const {
    entries: grantEntries,
    isLoading: isGrantFeedLoading,
    hasMore: hasMoreGrants,
    loadMore: loadMoreGrants,
  } = useFeed('all', grantFeedOptions);

  const header = (
    <div>
      <MainPageHeader
        icon={<Icon name="earn1" size={26} color="#3971ff" />}
        title="Earn ResearchCoin"
        subtitle="Earn ResearchCoin by completing scientific bounties"
        showTitle={false}
      />
      <EarnSectionCards />
    </div>
  );

  return (
    <FeedContent
      entries={grantEntries}
      isLoading={isGrantFeedLoading}
      hasMore={hasMoreGrants}
      loadMore={loadMoreGrants}
      header={header}
      filters={
        <GrantSortAndFilters
          grantCount={grantEntries.length}
          isLoading={isGrantFeedLoading}
          sortBy={grantSort}
          onSortChange={setGrantSort}
          className="mt-0"
        />
      }
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No open awards right now</p>
        </div>
      }
    />
  );
}
