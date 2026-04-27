import { Suspense } from 'react';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { GrantsPageContent } from './GrantsPageContent';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Funding Opportunities',
  description: 'Apply for funding opportunities via proposals.',
  url: '/grants',
});

export const revalidate = 3600;

async function getGrants() {
  try {
    const { grants } = await GrantService.getGrants({
      page: 1,
      pageSize: 50,
      ordering: 'best',
    });
    return grants;
  } catch {
    return [];
  }
}

export default async function GrantsPage() {
  const initialGrants = await getGrants();

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <GrantsPageContent initialGrants={initialGrants} />
    </PageLayout>
  );
}
