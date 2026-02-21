'use client';

import { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { HaveYouPublishedBanner } from '@/components/banners/HaveYouPublishedBanner';
import { PublishInJournalBanner } from '@/components/banners/PublishInJournalBanner';
import { EarningOpportunityBanner } from '@/components/banners/EarningOpportunityBanner';
import { SupportersSection } from './components/SupportersSection';
import { TopicsSection } from './components/TopicsSection';
import { DOISection } from './components/DOISection';
import { LicenseSection } from './components/LicenseSection';
import { FormatsSection } from './components/FormatsSection';
import { VersionsSection } from './components/VersionsSection';
import { JournalSection } from './components/JournalSection';
import { SimilarPapersSection } from './components/SimilarPapersSection';
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
      <EarningOpportunityBanner work={work} metadata={metadata} />
      {hasResearchHubJournalVersions && (
        <VersionsSection versions={work.versions || []} currentPaperId={work.id} slug={work.slug} />
      )}
      <SupportersSection tips={work.tips || []} documentId={work.id} />
      {work.journal && <JournalSection journal={work.journal} />}
      {/* Topics badges should not be hidden/collapsed differently on mobile */}
      <TopicsSection topics={metadata.topics || []} />
      {work.contentType === 'paper' && <SimilarPapersSection paperId={work.id} />}
      {work.doi && <DOISection doi={work.doi} />}
      {work.postType !== 'QUESTION' && <LicenseSection license={work.license} />}
      <FormatsSection formats={work.formats} />
    </div>
  );
};
