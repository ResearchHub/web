import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpFromLine, FileEdit, Users, ChevronRight, HandCoins } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';

function FundSubtitle() {
  return (
    <div className="flex items-center gap-2 text-md text-gray-500">
      <FileEdit className="w-4 h-4 text-gray-700 flex-shrink-0" />
      <span>Researchers propose</span>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <Users className="w-4 h-4 text-gray-700 flex-shrink-0" />
      <span>Experts review</span>
      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
      <HandCoins className="w-4 h-4 text-gray-700 flex-shrink-0" />
      <span>Funders allocate</span>
    </div>
  );
}

function SubmitProposalCTA() {
  return (
    <SubmitProposalTooltip>
      <Link href="/notebook?newFunding=true">
        <Button variant="default" size="lg" className="gap-2 w-full">
          Submit Proposal
          <ArrowUpFromLine className="w-5 h-5" />
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
          subtitle={<FundSubtitle />}
          cta={<SubmitProposalCTA />}
        />
      }
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer />
        </Suspense>
      }
    >
      <div>
        <FundraiseProvider>
          <ProposalSortAndFilters variant="all" />
          <ProposalFeed />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
