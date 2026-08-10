'use client';

import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';
import { useFundTabs } from '@/hooks/useFundTabs';

export function HomeTabs() {
  const { tabs, highlightedTab, handleTabChange } = useFundTabs();
  const tabsSentinelRef = useContentTabsVisibilitySentinel();

  return (
    <div ref={tabsSentinelRef} className="mb-2">
      <FeedTabs activeTab={highlightedTab} tabs={tabs} onTabChange={handleTabChange} />
    </div>
  );
}
