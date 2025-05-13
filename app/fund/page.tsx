'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { HandCoins } from 'lucide-react';
import { useFeed, FundingTab } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useState } from 'react';
import { FundingTabs } from '@/components/Fund/FundingTabs';
import { FundRightSidebar } from '@/components/Fund/FundRightSidebar';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import Icon from '@/components/ui/icons/Icon';

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState<FundingTab>('open');

  // Determine the fundraiseStatus based on the active tab
  const getFundraiseStatus = (tab: FundingTab): 'OPEN' | 'CLOSED' | undefined => {
    if (tab === 'open') return 'OPEN';
    if (tab === 'closed') return 'CLOSED';
    return undefined; // No status filter for the 'all' tab
  };

  const { entries, isLoading, hasMore, loadMore } = useFeed(activeTab, {
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    fundraiseStatus: getFundraiseStatus(activeTab),
  });

  const handleTabChange = (tab: FundingTab) => {
    setActiveTab(tab);
  };

  const header = (
    <MainPageHeader
      icon={<Icon name="solidHand" size={26} color="#4f46e5" />}
      title="Fund Science"
      subtitle="Fund breakthrough research shaping tomorrow"
    />
  );

  return (
    <PageLayout rightSidebar={<FundRightSidebar />}>
      <div className="pt-4 pb-7">{header}</div>
      <FundingTabs activeTab={activeTab} onTabChange={handleTabChange} isLoading={isLoading} />
      <FeedContent
        entries={entries}
        isLoading={isLoading}
        hasMore={hasMore}
        loadMore={loadMore}
        activeTab={activeTab as any}
      />
    </PageLayout>
  );
}
