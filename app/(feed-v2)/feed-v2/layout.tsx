import { ReactNode } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { FundingPowerBar } from '@/components/Funding/FundingPowerBar';
import { FundingPowerCard } from '@/components/Funding/FundingPowerCard';
import { HomeTabs } from '@/components/Funding/HomeTabs';
import { HomeFeedsProvider } from '@/components/Funding/HomeFeedsProvider';

export default function FeedV2Layout({ children }: { children: ReactNode }) {
  return (
    <PageLayout
      contentWidth="narrow"
      rightSidebar={<FundSidebar />}
      rightSidebarAbove={<FundingPowerCard className="w-full" />}
    >
      <HomeFeedsProvider>
        <FundingPowerBar className="mb-3" />
        <HomeTabs />
        {children}
      </HomeFeedsProvider>
    </PageLayout>
  );
}
