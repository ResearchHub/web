'use client';

import { Tabs } from '@/components/ui/Tabs';
import { useFundTabs } from '@/hooks/useFundTabs';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';
import { useUser } from '@/contexts/UserContext';
import { ActivityCacheBypassControl } from '@/components/Activity/ActivityCacheBypassControl';
import { IncludePrivateProposalsControl } from '@/components/Funding/IncludePrivateProposalsControl';

export function HomeTabs() {
  const { tabs, highlightedTab, handleTabChange, activeTab } = useFundTabs();
  const tabsSentinelRef = useContentTabsVisibilitySentinel(true);
  const { user } = useUser();

  const canUsePrivilegedFeedControls = !!user?.isModerator || !!user?.authorProfile?.isHubEditor;

  const rightContent = !canUsePrivilegedFeedControls ? undefined : activeTab === 'activity' ? (
    <ActivityCacheBypassControl />
  ) : activeTab === 'proposals' ? (
    <IncludePrivateProposalsControl />
  ) : activeTab === 'fund' ? (
    <IncludePrivateProposalsControl locked />
  ) : undefined;

  return (
    <div ref={tabsSentinelRef} className="mb-6 border-b border-gray-200">
      <Tabs
        tabs={tabs}
        activeTab={highlightedTab}
        onTabChange={handleTabChange}
        variant="primary"
        className="!border-b-0"
        rightContent={rightContent}
      />
    </div>
  );
}
