import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingPageContent } from './FundingPageContent';
import { ActivitySidebarServer } from '@/components/Funding/ActivitySidebarServer';
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

export default async function FundingPage() {
  const [{ grants, error }, closedGrants] = await Promise.all([getOpenGrants(), getClosedGrants()]);

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <ActivitySidebarServer />
        </Suspense>
      }
    >
      <FundingPageContent initialGrants={grants} closedGrants={closedGrants} error={error} />
    </PageLayout>
  );
}
