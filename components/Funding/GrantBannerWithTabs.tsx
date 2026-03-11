'use client';

import { GrantInfoBanner } from '@/components/Funding/GrantInfoBanner';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { Work } from '@/types/work';

interface GrantBannerWithTabsProps {
  amountUsd?: number;
  grantId?: string;
  isActive?: boolean;
  work?: Work;
  organization?: string;
}

export function GrantBannerWithTabs(props: GrantBannerWithTabsProps) {
  const { activeTab, setActiveTab } = useGrantTab();

  return <GrantInfoBanner {...props} activeTab={activeTab} onTabChange={setActiveTab} />;
}
