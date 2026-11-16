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
  const { proposalCount, isLoading: isLoadingProposals, isGrantScoped } = useFundraises();

  // The feed counts what it has loaded so far; with more to load it is a floor.
  const activityCount = activity.hasMore ? `${activity.count}+` : activity.count;

  return (
    <WorkPageTabs
      id={GRANT_TABS_ID}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as GrantBannerTab)}
      tabs={[
        { id: 'details', label: 'Details' },
        // Both counts arrive after the page: until the first one does, a blank
        // pill keeps its place. Proposals only load for an RFP with a grant.
        {
          id: 'proposals',
          label: 'Proposals',
          count: proposalCount,
          countLoading: isGrantScoped && isLoadingProposals && proposalCount === 0,
        },
        {
          id: 'activity',
          label: 'Activity',
          count: activityCount,
          countLoading: activity.isLoading && activity.count === 0,
        },
      ]}
    />
  );
}
