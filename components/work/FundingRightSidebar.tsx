import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { DOISection } from './components/DOISection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { FundingOpportunitySection } from './components/FundingOpportunitySection';
import { AuthorsSection } from './components/AuthorsSection';
import { ReviewsSection } from './components/ReviewsSection';

interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  // Try both sources for fundraise data -- metadata API and work object
  const fundraise = metadata.fundraising || work.fundraise;
  const grantApplication =
    metadata.fundraising?.grantApplication ||
    work.fundraise?.grantApplication;

  return (
    <div className="space-y-12">
      <EarningOpportunityBanner work={work} metadata={metadata} />

      {/* Funding Opportunity (Parent Grant) */}
      {grantApplication && (
        <FundingOpportunitySection grantApplication={grantApplication} />
      )}

      {/* About the Authors */}
      {work.authors.length > 0 && (
        <AuthorsSection authors={work.authors} />
      )}

      {/* Peer Reviews */}
      <ReviewsSection work={work} />

      {/* Existing Sections */}
      {fundraise && <NonprofitSection fundraiseId={fundraise.id} />}

      {fundraise &&
        fundraise.contributors &&
        fundraise.contributors.numContributors > 0 && (
          <FundersSection
            fundraise={fundraise}
            fundraiseTitle={work.title}
            work={work}
          />
        )}

      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
