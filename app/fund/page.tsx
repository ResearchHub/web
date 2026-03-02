import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
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
      scrollContainerClassName="pt-[108px]"
    >
      <div className="py-4">
        <FundingIntroBanner />
        <FundraiseProvider>
          <FundingProposalGrid />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
