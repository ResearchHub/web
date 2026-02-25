import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider } from '@/contexts/ProposalListContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { TotalFundingSection } from '@/components/Funding/TotalFundingSection';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';
import { PageHeader } from '@/components/ui/PageHeader';

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
        <PageHeader title="All Proposals" className="text-2xl md:!text-3xl mt-0" />
        <ProposalListProvider>
          <FundingProposalGrid />
        </ProposalListProvider>
      </div>
    </PageLayout>
  );
}
