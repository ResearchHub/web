import { Suspense } from 'react';
import { PaperService } from '@/services/paper.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkDocument } from '@/components/work/WorkDocument';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { getWorkMetadata } from '@/lib/metadata-helpers';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getWork(id: string) {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PaperService.get(id);
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const work = await getWork(resolvedParams.id);
  return getWorkMetadata({
    work: work,
    url: `/paper/${resolvedParams.id}/${resolvedParams.slug}/conversation`,
  });
}

export default async function WorkConversationPage({ params }: Props) {
  const resolvedParams = await params;
  const work = await getWork(resolvedParams.id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  if (!work) {
    notFound();
  }

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <WorkDocument work={work} metadata={metadata} defaultTab="conversation" />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
