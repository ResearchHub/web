'use client';

import { FeedTabs } from '@/components/Feed/FeedTabs';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';
import { useFundTabs } from '@/hooks/useFundTabs';

/**
 * Homepage hub tabs (Activity / Fund / Proposals). Pill style matches the old
 * for-you feed; the sentinel lifts a sticky copy into the TopBar on scroll.
 */
export function HomeTabs() {
  const { tabs, highlightedTab, handleTabChange } = useFundTabs();
  const tabsSentinelRef = useContentTabsVisibilitySentinel();

  return (
    <div ref={tabsSentinelRef} className="mb-2">
      <FeedTabs activeTab={highlightedTab} tabs={tabs} onTabChange={handleTabChange} />
    </div>
  );
}
