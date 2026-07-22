import { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { HeroHeader } from '@/components/ui/HeroHeader';
import { RegisteredReportsFeed } from '@/components/Journal/RegisteredReportsFeed';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Journal',
  description: 'Browse published Registered Reports.',
  url: '/journal',
});

export default function JournalHomePage() {
  return (
    <PageLayout
      rightSidebar={false}
      topBanner={
        <HeroHeader
          title="ResearchHub Journal"
          subtitle={
            <p className="text-sm text-gray-500 sm:text-base">Browse Registered Reports.</p>
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
    >
      <RegisteredReportsFeed />
    </PageLayout>
  );
}
