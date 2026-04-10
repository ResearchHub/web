import { Suspense } from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpFromLine } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { MarketplaceCards } from '@/components/Funding/MarketplaceCards';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Proposals',
  description: 'Propose research, get reviewed, receive funding.',
  url: '/fund/proposals',
});

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

export default async function FundProposalsPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="Proposals"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Propose research, get reviewed, receive funding.
            </p>
          }
          cta={<SubmitProposalCTA />}
        >
          <MarketplaceCards selected="proposals" />
        </HeroHeader>
      }
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <div>
        <ProposalSortAndFilters />
        <ProposalFeed />
      </div>
    </PageLayout>
  );
}
