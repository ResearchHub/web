'use client';

import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import {
  RecentActivityCard,
  RECENT_ACTIVITY_MAX_SHOWN,
} from '@/components/Activity/RecentActivityCard';
import { ProposalFundingCard } from './ProposalFundingCard';
import { ProposalReviewsCard } from './ProposalReviewsCard';
import { AiPeerReviewSection } from './components/AiPeerReviewSection';
import { NonprofitSection } from './components/NonprofitSection';

interface ProposalSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

/**
 * The proposal page's right sidebar, in the RFP sidebar's style: the funding
 * card over who reviewed it, then the AI's key insights and the nonprofit the
 * money goes to, where it has them, over the proposal's activity, which can run
 * long.
 */
export function ProposalSidebar({ work, metadata }: ProposalSidebarProps) {
  const fundraise = metadata.fundraising;

  return (
    <div className="flex flex-col gap-3">
      {fundraise && <ProposalFundingCard fundraise={fundraise} />}
      <ProposalReviewsCard work={work} />
      <AiPeerReviewSection aiPeerReview={work.aiPeerReview} />
      {fundraise && <NonprofitSection fundraiseId={fundraise.id} />}
      {work.unifiedDocumentId && (
        <ProposalRecentActivity unifiedDocumentId={work.unifiedDocumentId} postId={work.id} />
      )}
    </div>
  );
}

/**
 * The latest comments, reviews, updates and contributions on this proposal.
 * Proposals have no Activity tab, so it loads only what the card shows.
 */
function ProposalRecentActivity({
  unifiedDocumentId,
  postId,
}: {
  unifiedDocumentId: number;
  postId: number;
}) {
  const { entries, isLoading } = useActivityFeed({
    unifiedDocumentId,
    pageSize: RECENT_ACTIVITY_MAX_SHOWN,
  });

  return <RecentActivityCard entries={entries} isLoading={isLoading} currentDocumentId={postId} />;
}
