import Link from 'next/link';
import { Metadata } from 'next';
import { Plus } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { JournalNewPageContent } from './JournalNewPageContent';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'ResearchHub Journal',
  description: 'Browse completed funded proposals and published Registered Reports.',
  url: '/journal-new',
});

export default function JournalNewPage() {
  return (
    <PageLayout
      topBanner={
        <HeroHeader
          title="ResearchHub Journal"
          subtitle={
            <p className="text-sm sm:text-base text-gray-500">
              Browse funded proposals, Registered Reports, and results.
            </p>
          }
          cta={
            <Link
              href="/notebook?newFunding=true"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 sm:w-72"
            >
              <Plus className="h-5 w-5" />
              Proposal
            </Link>
          }
        />
      }
      rightSidebar={<RHJRightSidebar showBanner={false} />}
    >
      <section className="sr-only">
        <p>
          The new ResearchHub Journal feed lists completed funded proposals and Registered Reports
          in one post-based feed. Registered Reports appear first, and sorting is handled by the
          backend within each state.
        </p>
      </section>
      <JournalNewPageContent />
    </PageLayout>
  );
}
