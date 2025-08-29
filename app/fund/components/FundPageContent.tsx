'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { MarketplaceTabs, MarketplaceTab } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import { useState } from 'react';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { Badge } from '@/components/ui/Badge';
import { HubsSelector } from '@/components/Hub/HubSelector';

import { X, ChevronDown, Filter } from 'lucide-react';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const [sort, setSort] = useState<string>('-created_date');
  const [selectedHubs, setSelectedHubs] = useState<any[]>([]);

  const getFundraiseStatus = (tab: MarketplaceTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'needs-funding' || tab === 'grants') return 'OPEN';
    if (tab === 'previously-funded') return 'CLOSED';
    return undefined;
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: marketplaceTab === 'grants' ? 'GRANT' : 'PREREGISTRATION',
    endpoint: marketplaceTab === 'grants' ? 'grant_feed' : 'funding_feed',
    fundraiseStatus: getFundraiseStatus(marketplaceTab),
    ordering: sort,
  });

  const getTitle = (tab: MarketplaceTab): string => {
    switch (tab) {
      case 'grants':
        return 'Request for Proposals';
      case 'needs-funding':
        return 'Proposals';
      case 'previously-funded':
        return 'Previously Funded';
      default:
        return '';
    }
  };

  const getSubtitle = (tab: MarketplaceTab): string => {
    switch (tab) {
      case 'grants':
        return 'Explore available funding opportunities';
      case 'needs-funding':
        return 'Fund breakthrough research shaping tomorrow';
      case 'previously-funded':
        return 'Browse research that has been successfully funded';
      default:
        return '';
    }
  };

  const getSortOptions = (tab: MarketplaceTab): SortOption[] => {
    switch (tab) {
      case 'grants':
        return grantSortOptions;
      case 'needs-funding':
        return fundingProposalSortOption;
      case 'previously-funded':
        return previouslyFundedSortOptions;
    }
  };

  const getHubType = (tab: MarketplaceTab): 'grant' | 'bounty' | undefined => {
    switch (tab) {
      case 'grants':
        return 'grant';
      case 'needs-funding':
        return 'bounty';
      case 'previously-funded':
        return 'bounty';
      default:
        return undefined;
    }
  };

  const handleHubsChange = (hubs: any[]) => {
    setSelectedHubs(hubs);
  };

  const renderFilters = () => (
    <div className="mt-5 space-y-3">
      {/* Top filter bar */}
      <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
        <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
          <HubsSelector
            selectedHubs={selectedHubs}
            onChange={handleHubsChange}
            displayCountOnly
            hideSelectedItems={true}
            hubType={getHubType(marketplaceTab)}
          />
        </div>
        <div className="w-1/2 sm:!w-[120px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
          <SortDropdown
            value={sort}
            onChange={(opt: SortOption) => setSort(opt.value)}
            options={getSortOptions(marketplaceTab)}
          />
        </div>
      </div>

      {/* Selected hubs badges */}
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

  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#3971ff" />}
      title={getTitle(marketplaceTab)}
      subtitle={getSubtitle(marketplaceTab)}
    />
  );

  // Available sort options
  const grantSortOptions = [
    { value: '-unified_document__grants__amount', label: 'Amount' },
    { value: '-created_date', label: 'Created Date' },
    { value: 'unified_document__grants__end_date', label: 'Expiring soon' },
  ];

  const fundingProposalSortOption = [
    { value: '-unified_document__funding_proposals__amount', label: 'Amount Raised' },
    { value: 'test', label: 'Almost Funded' },
    { value: '-created_date', label: 'Created Date' },
    { value: 'unified_document__funding_proposals__end_date', label: 'Expiring soon' },
  ];

  const previouslyFundedSortOptions = [{ value: '-created_date', label: 'Created Date' }];

  const rightSidebar = marketplaceTab === 'grants' ? <GrantRightSidebar /> : <FundRightSidebar />;

  return (
    <PageLayout rightSidebar={rightSidebar}>
      {header}
      <MarketplaceTabs activeTab={marketplaceTab} onTabChange={() => {}} />

      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
        filters={renderFilters()}
      />
    </PageLayout>
  );
}
