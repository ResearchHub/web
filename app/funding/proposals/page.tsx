'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';
import { FundingPageTabs } from '@/components/Funding/FundingPageTabs';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ProposalListProvider } from '@/contexts/ProposalListContext';

export default function ProposalsPage() {
  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      <FundingPageTabs />

      <div className="py-4">
        <ProposalListProvider>
          <FundingProposalGrid />
        </ProposalListProvider>
      </div>
    </PageLayout>
  );
}
