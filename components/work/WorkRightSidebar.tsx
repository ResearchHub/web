'use client';

import { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { HaveYouPublishedBanner } from '@/components/banners/HaveYouPublishedBanner';
import { PublishInJournalBanner } from '@/components/banners/PublishInJournalBanner';
import { SupportersSection } from './components/SupportersSection';
import { TopicsSection } from './components/TopicsSection';
import { DOISection } from './components/DOISection';
import { LicenseSection } from './components/LicenseSection';
import { FormatsSection } from './components/FormatsSection';
import { VersionsSection } from './components/VersionsSection';
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
      <SupportersSection tips={work.tips || []} documentId={work.id} topics={work.topics} />
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && (
        <DOISection doi={work.doi} workId={work.id.toString()} contentType={work.contentType} />
      )}
      {work.postType !== 'QUESTION' && <LicenseSection license={work.license} />}
      <FormatsSection
        formats={work.formats}
        workId={work.id.toString()}
        contentType={work.contentType}
      />
    </div>
  );
};
