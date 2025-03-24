import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalPage } from '@/components/Journal/JournalPage';
import { JournalRightSidebar } from '@/components/Journal/JournalRightSidebar';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ResearchHub Journal',
  description:
    'Accelerate science through novel incentive structures that reward authors for reproducible research and compensate peer reviewers for their expertise',
};

export default function JournalHomePage() {
  return (
    <PageLayout rightSidebar={<JournalRightSidebar />}>
      <JournalPage />
    </PageLayout>
  );
}
