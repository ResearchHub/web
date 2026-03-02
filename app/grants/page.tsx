import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { GrantsPageContent } from './GrantsPageContent';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';

export const revalidate = 3600;

async function getGrantsByStatus(status: 'OPEN' | 'CLOSED') {
  try {
    const { grants } = await GrantService.getGrants({
      page: 1,
      pageSize: 50,
      status,
      ordering: 'best',
    });
    return grants;
  } catch {
    return [];
  }
}

export default async function GrantsPage() {
  const [openGrants, closedGrants] = await Promise.all([
    getGrantsByStatus('OPEN'),
    getGrantsByStatus('CLOSED'),
  ]);

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <GrantsPageContent openGrants={openGrants} closedGrants={closedGrants} />
    </PageLayout>
  );
}
