import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider } from '@/contexts/ProposalListContext';
import { ActivitySidebarServer } from '@/components/Funding/ActivitySidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';

export default function FundPage() {
  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <ActivitySidebarServer />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <div className="py-4">
        <ProposalListProvider>
          <FundingProposalGrid />
        </ProposalListProvider>
      </div>
    </PageLayout>
  );
}
