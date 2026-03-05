import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { FundingGrantTabs } from '@/components/Funding/FundingGrantTabs';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FundingIntroBanner } from '@/components/Funding/FundingIntroBanner';

export default async function FundPage() {
  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <div>
        <FundingIntroBanner />
        <FundraiseProvider>
          <FundingGrantTabs />
          <ProposalFeed />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
