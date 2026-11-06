import { Metadata } from 'next';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PourReviewGame } from '@/components/PourReview/PourReviewGame';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Pour Review',
  description:
    'A daily ResearchHub puzzle: measure out exactly the right amount in as few pours as you can.',
  url: '/pour-review',
});

export default function PourReviewPage() {
  return (
    <PageLayout rightSidebar={false}>
      <PourReviewGame />
    </PageLayout>
  );
}
