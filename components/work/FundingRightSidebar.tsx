import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { MetricsSection } from './components/MetricsSection';
import { DOISection } from './components/DOISection';
import { FundraiseSection } from './components/FundraiseSection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { ApplicantsSection } from './components/ApplicantsSection';

interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const FundingRightSidebar = ({ work, metadata }: FundingRightSidebarProps) => {
  return (
    <div className="space-y-12">
      {metadata.fundraising && <FundraiseSection fundraise={metadata.fundraising} />}
      {metadata.fundraising && <NonprofitSection fundraiseId={metadata.fundraising.id} />}
      {metadata.fundraising &&
        metadata.fundraising.contributors &&
        metadata.fundraising.contributors.numContributors > 0 && (
          <FundersSection fundraise={metadata.fundraising} />
        )}
      {/* Applicants for the grant */}
      {/* <ApplicantsSection grantId={work.id} /> */}
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
