import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Comment } from '@/types/comment';
import { MetricsSection } from './components/MetricsSection';
import { DOISection } from './components/DOISection';
import { FundraiseSection } from './components/FundraiseSection';
import { TopicsSection } from './components/TopicsSection';
import { NonprofitSection } from './components/NonprofitSection';
import { FundersSection } from './components/FundersSection';
import { ApplicantsSection } from './components/ApplicantsSection';
import { UpdatesSection } from './components/UpdatesSection';

interface FundingRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
  authorUpdates: Comment[];
}

export const FundingRightSidebar = ({
  work,
  metadata,
  authorUpdates,
}: FundingRightSidebarProps) => {
  return (
    <div className="space-y-12">
      {metadata.fundraising && <FundraiseSection fundraise={metadata.fundraising} />}
      {metadata.fundraising && <NonprofitSection fundraiseId={metadata.fundraising.id} />}
      {metadata.fundraising &&
        metadata.fundraising.contributors &&
        metadata.fundraising.contributors.numContributors > 0 && (
          <FundersSection fundraise={metadata.fundraising} fundraiseTitle={work.title} />
        )}
      {/* Updates Section */}
      <UpdatesSection
        updates={authorUpdates.map((comment) => ({
          id: comment.id,
          createdDate: comment.createdDate,
          content: comment.content,
        }))}
        startDate={work.createdDate}
        className="p-0"
      />
      {/* Applicants for the grant */}
      {/* <ApplicantsSection grantId={work.id} /> */}
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
    </div>
  );
};
