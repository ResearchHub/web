import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { PioneersFeed } from './PioneersFeed';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'The Pioneers | ResearchHub Journal',
  description:
    'Papers published in the previous ResearchHub Journal format, before the journal moved to funded registered reports.',
  url: '/journal-pioneers',
});

export default function PioneersPage() {
  return (
    <PageLayout rightSidebar={<RHJRightSidebar showBanner={false} />}>
      <div className="mb-6">
        <Link
          href="/journal"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-700"
        >
          <ArrowLeft size={14} />
          Back to journal
        </Link>

        <h1 className="mt-3 text-2xl font-bold text-gray-900">The Pioneers</h1>
        <p className="mt-1 text-gray-600">Published papers in the original journal format</p>
      </div>

      <PioneersFeed />
    </PageLayout>
  );
}
