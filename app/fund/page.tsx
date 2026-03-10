import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';

import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FundingHeroBanner } from '@/components/Funding/FundingHeroBanner';
import { GrantService } from '@/services/grant.service';

export default async function FundPage() {
  const funding = await GrantService.getAvailableFunding();

  return (
    <PageLayout
      topBanner={<FundingHeroBanner totalFundingUsd={funding.usd} />}
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <div>
        <FundraiseProvider>
          <ProposalSortAndFilters variant="all" />
          <ProposalFeed />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
