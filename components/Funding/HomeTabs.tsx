'use client';

import { Tabs } from '@/components/ui/Tabs';
import { useFundTabs } from '@/hooks/useFundTabs';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';

/**
 * Homepage hub tabs (Activity / Request for Proposals / Proposals).
 */
export function HomeTabs() {
  const { tabs, highlightedTab, handleTabChange } = useFundTabs();
  const tabsSentinelRef = useContentTabsVisibilitySentinel(true);

  return (
    <div ref={tabsSentinelRef} className="mb-2 border-b border-gray-200">
      <Tabs
        tabs={tabs}
        activeTab={highlightedTab}
        onTabChange={handleTabChange}
        variant="primary"
        className="!border-b-0"
      />
    </div>
  );
}
