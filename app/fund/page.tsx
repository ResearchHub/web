import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { TotalFundingSection } from '@/components/Funding/TotalFundingSection';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';
export default async function FundPage() {
  const { usd } = await GrantService.getAvailableFunding();

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer topSection={<TotalFundingSection totalUsd={usd} />} />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <div className="py-4">
        <FundraiseProvider>
          <FundingProposalGrid />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
