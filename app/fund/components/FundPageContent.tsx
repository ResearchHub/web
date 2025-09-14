'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { MarketplaceTabs, MarketplaceTab } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';
import SortDropdown, { SortOption } from '@/components/ui/SortDropdown';
import { useState } from 'react';
import { FundingSelector } from '@/components/Fund/FundingSelector';
import { IHub } from '@/types/hub';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const [selectedHubs, setSelectedHubs] = useState<IHub[]>([]);
  const [selectedVotes, setSelectedVotes] = useState<number>(0);
  const [selectedScore, setSelectedScore] = useState<number>(0);
  const [selectedVerifiedAuthorsOnly, setSelectedVerifiedAuthorsOnly] = useState<boolean>(false);
  const [selectedTaxDeductible, setSelectedTaxDeductible] = useState<boolean>(false);
  const [selectedPreviouslyFunded, setSelectedPreviouslyFunded] = useState<boolean>(false);
  const [sort, setSort] = useState<string>('amount_raised');

  const getFundraiseStatus = (tab: MarketplaceTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'needs-funding') {
      return selectedPreviouslyFunded ? 'CLOSED' : 'OPEN';
    }
    return undefined;
  };

  const getOrdering = (tab: MarketplaceTab): string | undefined => {
    if (tab === 'needs-funding') return sort;
    return undefined;
  };

  const getFiltering = (tab: MarketplaceTab): string | undefined => {
    if (tab !== 'needs-funding') return undefined;
    const filters = [];
    if (selectedHubs.length > 0) {
      const hubIds = selectedHubs.map((hub) => hub.id).join(',');
      filters.push(`hub_ids=${hubIds}`);
    }
    if (selectedVotes > 0) {
      filters.push(`min_votes=${selectedVotes}`);
    }
    if (selectedScore > 0) {
      filters.push(`min_score=${selectedScore}`);
    }
    if (selectedVerifiedAuthorsOnly) {
      filters.push(`verified_authors_only=true`);
    }
    if (selectedTaxDeductible) {
      filters.push(`tax_deductible=true`);
    }
    return filters.length > 0 ? encodeURIComponent(filters.join('&')) : undefined;
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: marketplaceTab === 'grants' ? 'GRANT' : 'PREREGISTRATION',
    endpoint: marketplaceTab === 'grants' ? 'grant_feed' : 'funding_feed',
    fundraiseStatus: getFundraiseStatus(marketplaceTab),
    ordering: marketplaceTab === 'grants' ? undefined : getOrdering(marketplaceTab),
    filtering: marketplaceTab === 'grants' ? undefined : getFiltering(marketplaceTab),
  });

  const getTitle = (tab: MarketplaceTab): string => {
    switch (tab) {
      case 'grants':
        return 'Request for Proposals';
      case 'needs-funding':
        return selectedPreviouslyFunded ? 'Previously Funded' : 'Proposals';
      default:
        return '';
    }
  };

  const getSubtitle = (tab: MarketplaceTab): string => {
    switch (tab) {
      case 'grants':
        return 'Explore available funding opportunities';
      case 'needs-funding':
        return selectedPreviouslyFunded
          ? 'Browse research that has been successfully funded'
          : 'Fund breakthrough research shaping tomorrow';
      default:
        return '';
    }
  };

  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#3971ff" />}
      title={getTitle(marketplaceTab)}
      subtitle={getSubtitle(marketplaceTab)}
    />
  );

  const rightSidebar = marketplaceTab === 'grants' ? <GrantRightSidebar /> : <FundRightSidebar />;

  const sortOptions = [
    { label: 'Best', value: 'amount_raised' },
    { label: 'Newest', value: 'newest' },
    { label: 'Expiring soon', value: 'expiring_soon' },
    { label: 'Near goal', value: 'goal_percent' },
  ];

  return (
    <PageLayout rightSidebar={rightSidebar}>
      {header}
      <MarketplaceTabs activeTab={marketplaceTab} onTabChange={() => {}} />

      {marketplaceTab === 'needs-funding' && (
        <div className="flex items-center gap-0 sm:gap-2 flex-wrap justify-between">
          <div className="w-1/2 sm:!w-[220px] flex-1 sm:!flex-none pr-1 sm:!pr-0">
            <FundingSelector
              selectedHubs={selectedHubs}
              onHubsChange={setSelectedHubs}
              selectedVotes={selectedVotes}
              onVotesChange={setSelectedVotes}
              selectedScore={selectedScore}
              onScoreChange={setSelectedScore}
              selectedVerifiedAuthorsOnly={selectedVerifiedAuthorsOnly}
              onVerifiedAuthorsOnlyChange={setSelectedVerifiedAuthorsOnly}
              selectedTaxDeductible={selectedTaxDeductible}
              onTaxDeductibleChange={setSelectedTaxDeductible}
              selectedPreviouslyFunded={selectedPreviouslyFunded}
              onPreviouslyFundedChange={setSelectedPreviouslyFunded}
              hideSelectedItems={true}
            />
          </div>
          <div className="w-1/2 sm:!w-[120px] flex-1 sm:!flex-none pl-1 sm:!pl-0">
            <SortDropdown
              value={sort}
              onChange={(opt: SortOption) => setSort(opt.value)}
              options={sortOptions}
            />
          </div>
        </div>
      )}

      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        showGrantHeaders={false}
      />
    </PageLayout>
  );
}
