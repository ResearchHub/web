import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { ReviewsPageContent } from './ReviewsPageContent';

export default async function EarnPage() {
  return (
    <PageLayout
      topBanner={<HeroHeader title="Earn RSC for Peer Reviews" />}
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
