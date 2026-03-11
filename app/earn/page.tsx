import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { EarnHeroBanner } from '@/components/Earn/EarnHeroBanner';
import { ReviewsPageContent } from './ReviewsPageContent';

export default async function EarnPage() {
  return (
    <PageLayout
      topBanner={<EarnHeroBanner />}
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer scope="peer_reviews" />
        </Suspense>
      }
    >
      <ReviewsPageContent />
    </PageLayout>
  );
}
