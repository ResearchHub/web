'use client';

import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';
import { ProposalFundingCard } from './ProposalFundingCard';
import { ProposalReviewsCard } from './ProposalReviewsCard';
import { AiPeerReviewSection } from './components/AiPeerReviewSection';
import { DOICard } from './components/DOISection';
import { NonprofitSection } from './components/NonprofitSection';

interface ProposalSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

/**
 * The proposal page's right sidebar, in the RFP sidebar's style: the funding
 * card over who reviewed it, then the AI's key insights, the nonprofit the
 * money goes to and the DOI, where it has them.
 */
export function ProposalSidebar({ work, metadata }: ProposalSidebarProps) {
  const fundraise = metadata.fundraising;

  return (
    <div className="flex flex-col gap-3">
      {fundraise && <ProposalFundingCard fundraise={fundraise} />}
      <ProposalReviewsCard work={work} />
      <AiPeerReviewSection aiPeerReview={work.aiPeerReview} />
      {fundraise && <NonprofitSection fundraiseId={fundraise.id} />}
      {work.doi && <DOICard doi={work.doi} />}
    </div>
  );
}
