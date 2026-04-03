import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { FundraiseSection } from './components/FundraiseSection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { PeerReviewsSection } from './components/PeerReviewsSection';
import { AIReviewSidebarSection } from './aiReview/AIReviewSidebarSection';
import { buildWorkUrl } from '@/utils/url';
import { DOISection } from './components/DOISection';

interface ProposalSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const ProposalSidebar = ({ work, metadata }: ProposalSidebarProps) => {
  return (
    <div className="space-y-12">
      {metadata.fundraising && <FundraiseSection fundraise={metadata.fundraising} />}
      {metadata.fundraising && <NonprofitSection fundraiseId={metadata.fundraising.id} />}
      {metadata.fundraising &&
        metadata.fundraising.contributors &&
        metadata.fundraising.contributors.numContributors > 0 && (
          <FundersSection
            fundraise={metadata.fundraising}
            fundraiseTitle={work.title}
            work={work}
          />
        )}
      <AIReviewSidebarSection
        reviewsUrl={buildWorkUrl({
          id: work.id,
          contentType: work.contentType,
          slug: work.slug,
          tab: 'reviews',
        })}
      />
      {work.peerReviews && work.peerReviews.length > 0 && (
        <PeerReviewsSection
          peerReviews={work.peerReviews}
          reviewsUrl={buildWorkUrl({
            id: work.id,
            contentType: work.contentType,
            slug: work.slug,
            tab: 'reviews',
          })}
        />
      )}
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
