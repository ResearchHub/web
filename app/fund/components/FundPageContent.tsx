'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useFeed, FundingTab } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useState } from 'react';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { GrantRightSidebar } from '@/components/Fund/GrantRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { MarketplaceTabs, MarketplaceTab, FundingStatus } from '@/components/Fund/MarketplaceTabs';
import Icon from '@/components/ui/icons/Icon';

interface FundPageContentProps {
  marketplaceTab: MarketplaceTab;
}

export function FundPageContent({ marketplaceTab }: FundPageContentProps) {
  const [activeFundingTab, setActiveFundingTab] = useState<FundingTab>('open');
  const [fundingStatus, setFundingStatus] = useState<FundingStatus>('open');

  // Determine the fundraiseStatus based on the active tab
  const getFundraiseStatus = (tab: FundingTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'open') return 'OPEN';
    if (tab === 'closed') return 'CLOSED';
    return undefined; // No status filter for the 'all' tab
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed(activeFundingTab, {
    contentType: marketplaceTab === 'needs-funding' ? 'PREREGISTRATION' : 'GRANT',
    endpoint: marketplaceTab === 'needs-funding' ? 'funding_feed' : 'grant_feed',
    fundraiseStatus:
      marketplaceTab === 'needs-funding' ? getFundraiseStatus(activeFundingTab) : undefined,
  });

  const handleStatusChange = (status: FundingStatus) => {
    setFundingStatus(status);
    // Convert status to funding tab for consistency
    if (status === 'completed') {
      setActiveFundingTab('closed' as FundingTab);
    } else {
      setActiveFundingTab('open' as FundingTab);
    }
  };

  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#4f46e5" />}
      title="Fund Science"
      subtitle="Fund breakthrough research shaping tomorrow"
    />
  );

  // Conditionally render sidebar based on active tab
  const rightSidebar =
    marketplaceTab === 'needs-funding' ? <FundRightSidebar /> : <GrantRightSidebar />;

  return (
    <PageLayout rightSidebar={rightSidebar}>
      <div className="pt-4 pb-7">{header}</div>

      {/* Primary Marketplace Tabs */}
      <MarketplaceTabs
        activeTab={marketplaceTab}
        onTabChange={() => {}} // Will be handled by routing
        fundingStatus={fundingStatus}
        onStatusChange={handleStatusChange}
      />

      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        activeTab={activeFundingTab as any}
        showGrantHeaders={false}
      />
    </PageLayout>
  );
}
