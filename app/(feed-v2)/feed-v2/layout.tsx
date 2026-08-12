import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { FundingPowerCard } from '@/components/Funding/FundingPowerCard';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

export default function FeedV2Layout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      rightSidebar={<FundSidebar />}
      rightSidebarAbove={<FundingPowerCard className="w-full" />}
    >
      <HomeFeedsProvider>
        <HomeTabs />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
