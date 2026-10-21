'use client';

import { FileText } from 'lucide-react';
import { faFileSignature } from '@fortawesome/pro-light-svg-icons';
import { faFileSignature as faFileSignatureSolid } from '@fortawesome/pro-solid-svg-icons';
import { useGrantPage, type GrantBannerTab } from '@/components/Funding/GrantPageContent';
import {
  RadiatingDotTabIcon,
  RadiatingDotTabIconActive,
} from '@/components/ui/RadiatingDotTabIcon';
import { StickyTabs } from '@/components/ui/StickyTabs';
import { fontAwesomeTabIcon } from '@/components/ui/icons/fontAwesomeTabIcon';
import { useFundraises } from '@/contexts/FundraiseContext';

const ProposalsIcon = fontAwesomeTabIcon(faFileSignature);
const ProposalsActiveIcon = fontAwesomeTabIcon(faFileSignatureSolid);

/** Details, Proposals and Activity, stuck to the top of the RFP page as it scrolls. */
export function GrantTabs({ className }: { className?: string }) {
  const { activeTab, setActiveTab, activity } = useGrantPage();
  const { proposalCount } = useFundraises();

  // The feed counts what it has loaded so far; with more to load it is a floor.
  const activityCount = activity.hasMore ? `${activity.count}+` : activity.count;

  return (
    <StickyTabs
      className={className}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as GrantBannerTab)}
      tabs={[
        { id: 'details', label: 'Details', icon: FileText },
        {
          id: 'proposals',
          label: 'Proposals',
          count: proposalCount,
          icon: ProposalsIcon,
          activeIcon: ProposalsActiveIcon,
        },
        {
          id: 'activity',
          label: 'Activity',
          count: activityCount,
          icon: RadiatingDotTabIcon,
          activeIcon: RadiatingDotTabIconActive,
          iconClassName: 'h-[18px] w-[18px]',
        },
      ]}
    />
  );
}
