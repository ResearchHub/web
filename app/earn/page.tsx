'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { PageLayout } from '../layouts/PageLayout';
import { FeedContent } from '@/components/Feed/FeedContent';
import { EarnRightSidebar } from '@/components/Earn/EarnRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';
import { BountyHubSelector as HubsSelector } from '@/components/Earn/BountyHubSelector';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { Badge } from '@/components/ui/Badge';
import { useBounties } from '@/hooks/useBounties';
import { useFeed } from '@/hooks/useFeed';
import { useGrants } from '@/contexts/GrantContext';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { FeedGrantContent } from '@/types/feed';
import { EarnSectionCards } from '@/components/Funding/EarnSectionCards';
import type { GrantSortOption } from '@/components/Funding/lib/grantSortConfig';

type EarnTab = 'awards' | 'reviews';

function EarnPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = (searchParams.get('tab') as EarnTab) || 'awards';

  const { grants, fetchGrants, totalFundingUsd, isLoading: isGrantsLoading } = useGrants();

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

  const {
    entries,
    isLoading,
    hasMore,
    loadMore,
    sort,
    handleSortChange,
    selectedHubs,
    handleHubsChange,
    restoredScrollPosition,
    page,
    total: bountyTotal,
    lastClickedEntryId,
  } = useBounties();

  const setTab = (tab: EarnTab) => {
    if (tab === 'awards') {
      router.replace('/earn', { scroll: false });
    } else {
      router.replace('/earn?tab=reviews', { scroll: false });
    }
  };

  const sortOptions = [
    { label: 'Best', value: 'personalized' },
    { label: 'Newest', value: '-created_date' },
    { label: 'Expiring soon', value: 'expiration_date' },
    { label: 'RSC amount', value: '-total_amount' },
  ];

  const renderFilters = () => (
    <div className="mt-5 space-y-3">
      <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
        <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={handleHubsChange}
            displayCountOnly
            hideSelectedItems={true}
          />
        </div>
        <div className="w-1/2 sm:!w-[120px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => handleSortChange(opt.value)}
            options={sortOptions}
          />
        </div>
      </div>

      {selectedHubs.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedHubs.map((hub) => (
            <Badge
              key={hub.id}
              variant="default"
              className="flex items-center gap-1 pr-1 bg-gray-50"
            >
              <span>Topic: {hub.name}</span>
              <button
                type="button"
                onClick={() => handleHubsChange(selectedHubs.filter((h) => h.id !== hub.id))}
                className="text-gray-500 hover:text-gray-700 ml-1"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );

  const sectionCards = (
    <EarnSectionCards
      activeTab={activeTab}
      onTabChange={setTab}
      openGrantCount={openGrants.length}
      totalFundingUsd={totalFundingUsd}
      bountyTotal={bountyTotal}
    />
  );

  if (activeTab === 'awards') {
    const awardsHeader = (
      <div className="">
        <div className="">
          <MainPageHeader
            icon={<Icon name="earn1" size={26} color="#3971ff" />}
            title="Earn ResearchCoin"
            subtitle="Earn ResearchCoin by completing scientific bounties"
            showTitle={false}
          />
        </div>
        {sectionCards}
      </div>
    );

    return (
      <FeedContent
        entries={grantEntries}
        isLoading={isGrantFeedLoading}
        hasMore={hasMoreGrants}
        loadMore={loadMoreGrants}
        header={awardsHeader}
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

  const header = (
    <div className="-mb-8">
      <MainPageHeader
        icon={<Icon name="earn1" size={26} color="#3971ff" />}
        title="Earn ResearchCoin"
        subtitle="Earn ResearchCoin by completing scientific bounties"
        showTitle={false}
      />
      {sectionCards}
    </div>
  );

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      header={header}
      filters={renderFilters()}
      showBountyFooter={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      showBountyInfo={true}
    />
  );
}

export default function EarnPage() {
  return (
    <PageLayout rightSidebar={<EarnRightSidebar />}>
      <EarnPageContent />
    </PageLayout>
  );
}
