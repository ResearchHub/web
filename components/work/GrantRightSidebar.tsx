'use client';

import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { ApplicantsSection } from './components/ApplicantsSection';
import { TopicsSection } from './components/TopicsSection';
import { GrantAmountSection } from './components/GrantAmountSection';
import { GrantStatusSection } from './components/GrantStatusSection';
import { DOISection } from './components/DOISection';

interface GrantRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const GrantRightSidebar = ({ work, metadata }: GrantRightSidebarProps) => {
  // Extract applicants from the grant data
  const applicants = work.note?.post?.grant?.applicants || [];

  return (
    <div className="space-y-8">
      <GrantAmountSection work={work} />
      <GrantStatusSection work={work} />
      <ApplicantsSection applicants={applicants} />
      {metadata.topics && metadata.topics.length > 0 && <TopicsSection topics={metadata.topics} />}
      {work.doi && (
        <DOISection doi={work.doi} workId={work.id.toString()} contentType={work.contentType} />
      )}
    </div>
  );
};
