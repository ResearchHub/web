import { Suspense } from 'react';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { FundGrantsPageContent } from './FundGrantsPageContent';
import { MarketplaceCards } from '@/components/Funding/MarketplaceCards';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Funding Opportunities',
  description: 'Apply for funding opportunities via proposals.',
  url: '/fund',
});

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
      <section className="sr-only">
        <p>
          ResearchHub provides direct funding pathways for scientific research. Browse open funding
          opportunities posted by the ResearchHub Foundation and community funders, or create a
          proposal to pitch your own research for funding consideration.
        </p>
        <p>
          Each funding opportunity includes a defined scope of work, funding amount in ResearchCoin
          (RSC) or USD, and a deadline for submissions. Opportunities span a range of disciplines —
          biomedical sciences, computational biology, physics, economics, and beyond — so there is
          likely one relevant to your area of expertise. Researchers who find a match can apply
          directly, with all materials submitted and reviewed on-platform.
        </p>
        <p>
          Researchers can also create their own proposals to pursue original work. Each proposal
          undergoes open peer review where community members and domain experts evaluate the
          methodology, significance, and feasibility of the research. Funded projects receive RSC
          directly, with no intermediaries or extended application cycles.
        </p>
        <p>
          Traditional funding processes often involve months of preparation and long wait times.
          ResearchHub streamlines this with clear requirements, open peer review, and practical
          timelines. The entire process is visible on-platform from submission to funding decision.
          Browse the open opportunities below, or switch to the Proposals tab to see
          community-submitted research plans seeking support.
        </p>
      </section>
      <FundGrantsPageContent />
    </PageLayout>
  );
}
