'use client';

import {
  GRANT_TABS_ID,
  useGrantActivity,
  useGrantPage,
  type GrantBannerTab,
} from '@/components/Funding/GrantPageContext';
import { WorkPageTabs } from '@/components/work/WorkPageTabs';
import { useFundraises } from '@/contexts/FundraiseContext';

/** Details, Proposals and Activity, under the RFP's cover and stuck to the top as it scrolls. */
export function GrantTabs() {
  const { activeTab, setActiveTab } = useGrantPage();
  const activity = useGrantActivity();
  const { proposalCount } = useFundraises();

  // The feed counts what it has loaded so far; with more to load it is a floor.
  const activityCount = activity.hasMore ? `${activity.count}+` : activity.count;

  return (
    <WorkPageTabs
      id={GRANT_TABS_ID}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as GrantBannerTab)}
      tabs={[
        { id: 'details', label: 'Details' },
        { id: 'proposals', label: 'Proposals', count: proposalCount },
        { id: 'activity', label: 'Activity', count: activityCount },
      ]}
    />
  );
}
