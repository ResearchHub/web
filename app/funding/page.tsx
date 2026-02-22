import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingPageContent } from './FundingPageContent';
import { ActivitySidebarServer } from '@/components/Funding/ActivitySidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';

export default function FundingPage() {
  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <ActivitySidebarServer />
        </Suspense>
      }
    >
      <FundingPageContent />
    </PageLayout>
  );
}
