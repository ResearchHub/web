import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowUpFromLine } from 'lucide-react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { Button } from '@/components/ui/Button';
import { SubmitProposalTooltip } from '@/components/tooltips/SubmitProposalTooltip';
import { FundGrantsPageContent } from './FundGrantsPageContent';
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

export default async function FundGrantsPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="Funding Opportunities"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Browse opportunities to submit research proposals for.
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
      <MarketplaceCards selected="grants" />
      <FundGrantsPageContent />
    </PageLayout>
  );
}
