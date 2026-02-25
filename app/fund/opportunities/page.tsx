import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingPageContent } from '../components/FundingPageContent';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { TotalFundingSection } from '@/components/Funding/TotalFundingSection';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';

export const revalidate = 3600;

async function getOpenGrants() {
  try {
    const { grants } = await GrantService.getGrants({
      page: 1,
      pageSize: 20,
      status: 'OPEN',
      ordering: 'most_applicants',
    });
    return { grants, error: null };
  } catch (error) {
    console.error('Failed to fetch grants:', error);
    return { grants: [], error: 'Failed to load funding opportunities.' };
  }
}

async function getClosedGrants() {
  try {
    const { grants } = await GrantService.getGrants({
      page: 1,
      pageSize: 20,
      status: 'CLOSED',
      ordering: 'most_applicants',
    });
    return grants;
  } catch {
    return [];
  }
}

export default async function OpportunitiesPage() {
  const [{ grants, error }, closedGrants, { usd }] = await Promise.all([
    getOpenGrants(),
    getClosedGrants(),
    GrantService.getAvailableFunding(),
  ]);

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer topSection={<TotalFundingSection totalUsd={usd} />} />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <FundingPageContent initialGrants={grants} closedGrants={closedGrants} error={error} />
    </PageLayout>
  );
}
