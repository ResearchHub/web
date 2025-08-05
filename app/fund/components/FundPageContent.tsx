'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { MarketplaceTabs, MarketplaceTab } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const getFundraiseStatus = (tab: MarketplaceTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'needs-funding') return 'OPEN';
    if (tab === 'previously-funded') return 'CLOSED';
    return undefined;
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    contentType: marketplaceTab === 'grants' ? 'GRANT' : 'PREREGISTRATION',
    endpoint: marketplaceTab === 'grants' ? 'grant_feed' : 'funding_feed',
    fundraiseStatus: getFundraiseStatus(marketplaceTab),
  });

  const getTitle = (tab: MarketplaceTab): string => {
    switch (tab) {
      case 'grants':
        return 'Request for proposals';
      case 'needs-funding':
        return 'Proposals (Open)';
      case 'previously-funded':
        return 'Proposals (Completed)';
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

  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#3971ff" />}
      title={getTitle(marketplaceTab)}
      subtitle={getSubtitle(marketplaceTab)}
    />
  );

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
      />
    </PageLayout>
  );
}
