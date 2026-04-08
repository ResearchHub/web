import { Suspense } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { FundGrantsPageContent } from './FundGrantsPageContent';
import { MarketplaceCards } from '@/components/Funding/MarketplaceCards';

export default async function FundPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="Funding Opportunities"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Apply for funding opportunities via proposals.
            </p>
          }
        >
          <MarketplaceCards selected="grants" />
        </HeroHeader>
      }
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <FundGrantsPageContent />
    </PageLayout>
  );
}
