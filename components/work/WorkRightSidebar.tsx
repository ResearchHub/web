'use client';

import { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { TopicsSection } from './components/TopicsSection';
import { DOISection } from './components/DOISection';
import { LicenseSection } from './components/LicenseSection';
import { FormatsSection } from './components/FormatsSection';
import { VersionsSection } from './components/VersionsSection';
import { PeerReviewsSection } from './components/PeerReviewsSection';
import { buildWorkUrl } from '@/utils/url';

interface WorkRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const WorkRightSidebar = ({ work, metadata }: WorkRightSidebarProps) => {
  return (
    <div className="space-y-8">
      <VersionsSection versions={work.versions || []} currentPaperId={work.id} slug={work.slug} />
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
      {work.postType !== 'QUESTION' && <LicenseSection license={work.license} />}
      <FormatsSection formats={work.formats} />
    </div>
  );
};
