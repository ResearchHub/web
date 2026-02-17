'use client';

import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingTabs } from '@/components/Funding/FundingTabs';
import { GrantPreviewAll } from '@/components/Funding/GrantPreviewAll';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';

export default function FundingPage() {
  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <FundingTabs />
      </div>

      {/* Available Funding Overview */}
      <GrantPreviewAll className="mb-8" />

      {/* All Proposals */}
      <FundingProposalGrid />
    </PageLayout>
  );
}
