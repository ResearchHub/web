import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalShowcase } from '@/components/Journal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ResearchHub Journal Showcase',
  description:
    'Discover the latest research published in ResearchHub Journal. From preprints to peer-reviewed articles, explore cutting-edge findings from researchers around the world.',
};

export default function JournalShowcasePage() {
  return (
    <PageLayout rightSidebar={false}>
      <JournalShowcase />
    </PageLayout>
  );
}
