import { PageLayout } from '@/app/layouts/PageLayout';
import { JournalShowcase } from '@/components/Journal';
import { Metadata } from 'next';

export default function JournalShowcasePage() {
  return (
    <PageLayout rightSidebar={false}>
      <JournalShowcase />
    </PageLayout>
  );
}
