'use client';

import { useEffect, useMemo, useState } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { useFeed } from '@/hooks/useFeed';
import { useGrants } from '@/contexts/GrantContext';
import { useBounties } from '@/hooks/useBounties';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { EarnSectionCards } from '@/components/Funding/EarnSectionCards';
import { FeedGrantContent } from '@/types/feed';
import type { GrantSortOption } from '@/components/Funding/lib/grantSortConfig';

export function EarnPageContent() {
  const { grants, fetchGrants, totalFundingUsd } = useGrants();
  const { total: bountyTotal } = useBounties();

  useEffect(() => {
    fetchGrants();
  }, [fetchGrants]);

  const openGrants = useMemo(
    () =>
      grants.filter((g) => {
        const content = g.content as FeedGrantContent;
        return content.grant.status !== 'CLOSED';
      }),
    [grants]
  );

  const [grantSort, setGrantSort] = useState<GrantSortOption>('most_applicants');

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
      <EarnSectionCards
        openGrantCount={openGrants.length}
        totalFundingUsd={totalFundingUsd}
        bountyTotal={bountyTotal}
      />
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
