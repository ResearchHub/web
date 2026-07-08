import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { FundraiseSection } from './components/FundraiseSection';
import { FundingOpportunitySection } from './components/FundingOpportunitySection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { PeerReviewsSection } from './components/PeerReviewsSection';
import { AiPeerReviewSection } from './components/AiPeerReviewSection';
import { buildWorkUrl } from '@/utils/url';
import { DOISection } from './components/DOISection';
import {
  getDemoExpertPeerReviews,
  isDemoExpertReviewsProposalId,
} from './lib/demoExpertReviews';

interface ProposalSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const ProposalSidebar = ({ work, metadata }: ProposalSidebarProps) => {
  // Demo-only: surface the scripted expert reviews in the sidebar's Peer
  // Reviews summary for the one demo proposal, alongside any real reviews.
  const peerReviews = isDemoExpertReviewsProposalId(work.id)
    ? [...getDemoExpertPeerReviews(), ...(work.peerReviews ?? [])]
    : work.peerReviews;

  return (
    <div className="space-y-12">
      {work.aiPeerReview && <AiPeerReviewSection aiPeerReview={work.aiPeerReview} />}
      {metadata.fundraising && <FundraiseSection fundraise={metadata.fundraising} />}
      {metadata.fundraising &&
        metadata.fundraising.contributors &&
        metadata.fundraising.contributors.numContributors > 0 && (
          <FundersSection
            fundraise={metadata.fundraising}
            fundraiseTitle={work.title}
            work={work}
          />
        )}
      {peerReviews && peerReviews.length > 0 && (
        <PeerReviewsSection
          peerReviews={peerReviews}
          reviewsUrl={buildWorkUrl({
            id: work.id,
            contentType: work.contentType,
            slug: work.slug,
            tab: 'reviews',
          })}
        />
      )}
      {work.linkedGrant && <FundingOpportunitySection grant={work.linkedGrant} />}
      {metadata.fundraising && <NonprofitSection fundraiseId={metadata.fundraising.id} />}
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
