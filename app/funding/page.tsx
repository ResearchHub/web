'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { useGrants } from '@/contexts/GrantContext';
import { GrantList } from '@/components/Funding/GrantList';
import { ActivitySidebar } from '@/components/Funding/ActivitySidebar';
import { FundingPageTabs } from '@/components/Funding/FundingPageTabs';
import { GrantCarouselSkeleton } from '@/components/skeletons/GrantCarouselSkeleton';

export default function FundingPage() {
  const { grants, isLoading } = useGrants();

  return (
    <PageLayout rightSidebar={<ActivitySidebar />}>
      <FundingPageTabs />

      {isLoading ? (
        <GrantCarouselSkeleton />
      ) : (
        <GrantList grants={grants} emptyMessage="No funding opportunities available right now." />
      )}
    </PageLayout>
  );
}
