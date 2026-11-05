'use client';

import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';
import { isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { AwardProposalCard } from './AwardProposalCard';
import { ProposalFundingCard } from './ProposalFundingCard';
import { ProposalReviewsCard } from './ProposalReviewsCard';
import { AiPeerReviewSection } from './components/AiPeerReviewSection';
import { NonprofitSection } from './components/NonprofitSection';

interface ProposalSidebarProps {
  work: Work;
  metadata: WorkMetadata;
  /** The authors' updates, counted from the layout's fetch of them. */
  updatesCount?: number;
  /** When the newest update was posted. */
  latestUpdateDate?: string;
}

/**
 * The proposal page's right sidebar, in the RFP sidebar's style: the funding
 * card over who reviewed it, then the AI's key insights and the nonprofit the
 * money goes to, where it has them.
 */
export function ProposalSidebar({
  work,
  metadata,
  updatesCount,
  latestUpdateDate,
}: ProposalSidebarProps) {
  const fundraise = metadata.fundraising;
  const isAward = isAwardMechanism(work.linkedGrant?.fundingMechanism);

  return (
    <div className="flex flex-col gap-3">
      {fundraise && isAward && work.linkedGrant && (
        <AwardProposalCard
          work={work}
          fundraise={fundraise}
          linkedGrant={work.linkedGrant}
          publishedDate={work.publishedDate || work.createdDate}
          updatesCount={updatesCount}
          latestUpdateDate={latestUpdateDate}
        />
      )}
      {fundraise && !isAward && <ProposalFundingCard fundraise={fundraise} />}
      <ProposalReviewsCard work={work} />
      <AiPeerReviewSection aiPeerReview={work.aiPeerReview} />
      {fundraise && <NonprofitSection fundraiseId={fundraise.id} />}
    </div>
  );
}
