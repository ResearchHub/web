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

interface WorkRightSidebarProps {
  work: Work;
  metadata: WorkMetadata;
}

export const WorkRightSidebar = ({ work, metadata }: WorkRightSidebarProps) => {
  return (
    <div className="space-y-8">
      <VersionsSection versions={work.versions || []} currentPaperId={work.id} />
      <SupportersSection tips={work.tips || []} documentId={work.id} />
      <TopicsSection topics={metadata.topics || []} />
      {work.doi && <DOISection doi={work.doi} />}
      <LicenseSection license={work.license} />
      <FormatsSection formats={work.formats} />
    </div>
  );
};
