'use client';

import { useEffect } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingTabs } from '@/components/Funding/FundingTabs';
import { GrantPreview } from '@/components/Funding/GrantPreview';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { ActivityFeed } from '@/components/Funding/ActivityFeed';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { useGrants } from '@/contexts/GrantContext';

interface FundingGrantPageClientProps {
  initialGrant: FeedEntry;
  grantId: number;
}

export function FundingGrantPageClient({ initialGrant, grantId }: FundingGrantPageClientProps) {
  const { selectGrant, selectedGrant, grants } = useGrants();

  // Set the selected grant when the component mounts or grantId changes
  useEffect(() => {
    // Try to find the grant in the cached grants first
    const cachedGrant = grants.find((g) => {
      const content = g.content as FeedGrantContent;
      return content.grant?.id === grantId || content.id === grantId;
    });

    if (cachedGrant) {
      selectGrant(grantId);
    }
  }, [grantId, grants, selectGrant]);

  // Use the initial grant from SSR or the selected grant from context
  const grant = selectedGrant || initialGrant;
  const grantContent = grant.content as FeedGrantContent;

  return (
    <PageLayout rightSidebar={<ActivityFeed />}>
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <FundingTabs selectedGrantId={grantContent.grant?.id || grantId} />
      </div>

      {/* Grant Preview */}
      <GrantPreview grant={grant} className="mb-8" />

      {/* Proposals for this grant */}
      <FundingProposalGrid grantId={grantContent.grant?.id || grantId} />
    </PageLayout>
  );
}
