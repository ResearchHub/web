'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { MarketplaceTabs, MarketplaceTab } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { useState, useEffect } from 'react';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { HubsSelector, HubsSelected, Hub } from '@/components/Hub/HubSelector';

const SORT_OPTIONS_MAP: Record<MarketplaceTab, SortOption[]> = {
  grants: [
    { value: 'grants__amount', label: 'Amount' },
    { value: 'newest', label: 'Created date' },
    { value: 'end_date', label: 'Expiring soon' },
    { value: 'application_count', label: 'Most applications' },
  ],
  'needs-funding': [
    { value: 'newest', label: 'Created date' },
    { value: 'hot_score', label: 'Popular' },
    { value: 'upvotes', label: 'Most upvoted' },
    { value: 'amount_raised', label: 'Amount raised' },
    { value: 'goal_amount', label: 'Goal' },
    { value: 'end_date', label: 'Expiring soon' },
    { value: 'review_count', label: 'Most reviews' },
  ],
  'previously-funded': [
    { value: 'goal_amount', label: 'Goal' },
    { value: 'amount_raised', label: 'Amount raised' },
    { value: 'newest', label: 'Created date' },
  ],
};

const DEFAULT_SORT_MAP: Record<MarketplaceTab, string> = {
  grants: 'end_date',
  'needs-funding': 'end_date',
  'previously-funded': 'newest',
};

// Needs replaced with getPageInfo from layouts/TopBar.tsx
const PAGE_TITLE_MAP: Record<MarketplaceTab, string> = {
  grants: 'Request for Proposals',
  'needs-funding': 'Proposals',
  'previously-funded': 'Previously Funded',
};

// Needs replaced with getPageInfo from layouts/TopBar.tsx
const PAGE_SUBTITLE_MAP: Record<MarketplaceTab, string> = {
  grants: 'Explore available funding opportunities',
  'needs-funding': 'Fund breakthrough research shaping tomorrow',
  'previously-funded': 'Browse research that has been successfully funded',
};

const HUB_TYPE_MAP: Record<MarketplaceTab, 'grant' | 'needs-funding' | 'bounty' | undefined> = {
  grants: 'grant',
  'needs-funding': 'needs-funding',
  'previously-funded': 'bounty',
};

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const [sort, setSort] = useState<string>(DEFAULT_SORT_MAP[marketplaceTab]);
  const [selectedHubs, setSelectedHubs] = useState<Hub[]>([]);
  const [managedEntries, setManagedEntries] = useState<any[]>([]);

  const getFundraiseStatus = (tab: MarketplaceTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'needs-funding' || tab === 'grants') return 'OPEN';
    if (tab === 'previously-funded') return 'CLOSED';
    return undefined;
  };

  const { entries, isLoading, hasMore, loadMore, refresh } = useFeed('all', {
    contentType: marketplaceTab === 'grants' ? 'GRANT' : 'PREREGISTRATION',
    endpoint: marketplaceTab === 'grants' ? 'grant_feed' : 'funding_feed',
    fundraiseStatus: getFundraiseStatus(marketplaceTab),
    ordering: sort,
    hubIds: selectedHubs.map((h) => h.id),
  });

  // Manage the entries separate from hook to allow for clearing the feed when filter and sort options change.
  useEffect(() => {
    setManagedEntries(entries);
  }, [entries]);

  useEffect(() => {
    setManagedEntries([]);
    refresh();
  }, [sort, selectedHubs]);

  const handleHubsChange = (hubs: any[]) => {
    setSelectedHubs(hubs);
  };

  const renderFilters = () => (
    <div className="space-y-3">
      {/* Top filter bar */}
      <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
        <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={handleHubsChange}
            hubType={HUB_TYPE_MAP[marketplaceTab]}
          />
        </div>
        <div className="w-1/2 sm:!w-[160px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => setSort(opt.value)}
            options={SORT_OPTIONS_MAP[marketplaceTab]}
          />
        </div>
      </div>

      {selectedHubs.length > 0 && (
        <HubsSelected selectedHubs={selectedHubs} onChange={handleHubsChange} />
      )}
    </div>
  );

  // Special headers for mobile. Needs resolved with TopBar
  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#3971ff" />}
      title={PAGE_TITLE_MAP[marketplaceTab]}
      subtitle={PAGE_SUBTITLE_MAP[marketplaceTab]}
    />
  );

  const rightSidebar = marketplaceTab === 'grants' ? <GrantRightSidebar /> : <FundRightSidebar />;

  return (
    <PageLayout rightSidebar={rightSidebar}>
      {header}
      <MarketplaceTabs activeTab={marketplaceTab} onTabChange={() => {}} />

      <FeedContent
        entries={managedEntries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
        filters={renderFilters()}
      />
    </PageLayout>
  );
}
