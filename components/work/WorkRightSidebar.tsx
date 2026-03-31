'use client';

import { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { HaveYouPublishedBanner } from '@/components/banners/HaveYouPublishedBanner';
import { PublishInJournalBanner } from '@/components/banners/PublishInJournalBanner';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { TopicsSection } from './components/TopicsSection';
import { DOISection } from './components/DOISection';
import { LicenseSection } from './components/LicenseSection';
import { FormatsSection } from './components/FormatsSection';
import { VersionsSection } from './components/VersionsSection';
import { JournalSection } from './components/JournalSection';
import { PeerReviewsSection } from './components/PeerReviewsSection';
import { buildWorkUrl } from '@/utils/url';
import { useMemo } from 'react';

interface WorkRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const WorkRightSidebar = ({ work, metadata }: WorkRightSidebarProps) => {
  // Check if any version is part of the ResearchHub journal
  const hasResearchHubJournalVersions = useMemo(() => {
    return (work.versions || []).some((version) => version.isResearchHubJournal);
  }, [work.versions]);

  return (
    <div className="space-y-8">
      {hasResearchHubJournalVersions && (
        <VersionsSection versions={work.versions || []} currentPaperId={work.id} slug={work.slug} />
      )}
      {work.journal && <JournalSection journal={work.journal} />}
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
