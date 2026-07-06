import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { RhJournalFeed } from './RhJournalFeed';
import { RegisteredReportsSidebar } from './components/RegisteredReportsSidebar';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Journal of Registered Reports',
  description:
    'A ResearchHub journal for funded proposals — studies whose methods are peer reviewed and locked before any data are collected, and published regardless of the outcome.',
  url: '/rh-journal',
});

export default function RhJournalPage() {
  return (
    <PageLayout rightSidebar={<RegisteredReportsSidebar />}>
      <RhJournalFeed />
    </PageLayout>
  );
}
