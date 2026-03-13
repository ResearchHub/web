import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpFromLine } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { MarketplaceCards } from '@/components/Funding/MarketplaceCards';

function SubmitProposalCTA() {
  return (
    <SubmitProposalTooltip>
      <Link href="/notebook?newFunding=true">
        <Button
          variant="default"
          size="lg"
          className="gap-2 w-full max-sm:!text-xs max-sm:!h-8 max-sm:!px-2"
        >
          Submit Proposal
          <ArrowUpFromLine className="w-4 h-4 sm:w-5 sm:h-5" />
        </Button>
      </Link>
    </SubmitProposalTooltip>
  );
}

export default async function FundPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="Open Science Funding Marketplace"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Propose research, get reviewed, receive funding.
            </p>
          }
          cta={<SubmitProposalCTA />}
        />
      }
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <MarketplaceCards selected="proposals" />
      <div>
        <FundraiseProvider>
          <ProposalSortAndFilters variant="all" />
          <ProposalFeed />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
