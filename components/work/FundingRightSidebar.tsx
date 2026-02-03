import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { MetricsSection } from './components/MetricsSection';
import { DOISection } from './components/DOISection';
import { FundraiseSection } from './components/FundraiseSection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { ApplicantsSection } from './components/ApplicantsSection';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';

interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  return (
    <div className="space-y-12">
      <EarningOpportunityBanner work={work} metadata={metadata} />
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
      {/* Applicants for the grant */}
      {/* <ApplicantsSection grantId={work.id} /> */}
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
