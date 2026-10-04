'use client';

import { ActivitySidebar, ActivitySidebarSkeleton } from '@/components/Activity';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';

interface MyFundingSidebarProps {
  readonly activity: MyFundingActivity;
}

/** The funding activity rail, using the same compact presentation as RFP pages. */
export function MyFundingSidebar({ activity }: MyFundingSidebarProps) {
  if (activity.isLoading) {
    return <ActivitySidebarSkeleton />;
  }

  return <ActivitySidebar entries={activity.entries.slice(0, 15)} error={activity.error != null} />;
}
