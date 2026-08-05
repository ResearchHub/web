'use client';

import { Tabs } from '@/components/ui/Tabs';
import { useFundTabs } from '@/hooks/useFundTabs';

/**
 * Homepage hub tabs (Activity / Request for Proposals / Proposals).
 */
export function HomeTabs() {
  const { tabs, highlightedTab, handleTabChange } = useFundTabs();

  return (
    <div className="mb-2 border-b border-gray-200">
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
