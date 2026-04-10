import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalPage } from '@/components/Journal/JournalPage';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'ResearchHub Journal',
  description:
    'Accelerate science through novel incentive structures that reward authors for reproducible research and compensate peer reviewers for their expertise',
  url: '/journal',
});

export default function JournalHomePage() {
  return (
    <PageLayout rightSidebar={<RHJRightSidebar />}>
      <JournalPage />
    </PageLayout>
  );
}
