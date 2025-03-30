'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { HandCoins } from 'lucide-react';
import { useFeed, FundingTab } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useState } from 'react';
import { FundingTabs } from '@/components/Fund/FundingTabs';

export default function FundingPage() {
  const [activeTab, setActiveTab] = useState<FundingTab>('all');

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
    <h2 className="text-xl text-gray-600 flex items-center gap-2">
      <HandCoins className="w-5 h-5 text-indigo-500" />
      Fund breakthrough research shaping tomorrow
    </h2>
  );

  return (
    <PageLayout>
      <div className="pt-4 pb-7">{header}</div>
      <FundingTabs activeTab={activeTab} onTabChange={handleTabChange} isLoading={isLoading} />
      <FeedContent entries={entries} isLoading={isLoading} hasMore={hasMore} loadMore={loadMore} />
    </PageLayout>
  );
}
