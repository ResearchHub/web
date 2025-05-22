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

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getWorkData(id: string): Promise<{ work: Work; metadata: any }> {
  if (!id || !id.match(/^\d+$/)) {
    notFound();
  }
  try {
    const work = await PaperService.get(id);
    if (!work) notFound();
    const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');
    return { work, metadata };
  } catch (error) {
    console.error('Failed to fetch work data:', error);
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const workForMeta = await PaperService.get(resolvedParams.id).catch(() => null);
  if (!workForMeta) {
    return { title: 'History Not Found' };
  }
  return {
    title: `${workForMeta.title} - History`,
    description: `Version history for ${workForMeta.title}`,
  };
}

export default async function WorkHistoryPage({ params }: Props) {
  const resolvedParams = await params;
  const { work, metadata } = await getWorkData(resolvedParams.id);

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={work} metadata={metadata} />}>
      <Suspense fallback={<div>Loading document...</div>}>
        <WorkDocument work={work} metadata={metadata} defaultTab="history" />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
