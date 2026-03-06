import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { ReviewsPageContent } from './ReviewsPageContent';

export default async function ReviewsPage() {
  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <ReviewsPageContent />
    </PageLayout>
  );
}
