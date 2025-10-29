import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingRightSidebar } from '@/components/work/FundingRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { GrantDocument } from '@/components/work/GrantDocument';
import { GrantRightSidebar } from '@/components/work/GrantRightSidebar';
import { getWorkMetadata } from '@/lib/metadata-helpers';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}
async function getWorkHTMLContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return undefined;
  }
}

async function getGrant(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    const work = await PostService.get(id);
    return work;
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const grant = await getGrant(resolvedParams.id);
  return getWorkMetadata({
    work: grant,
    url: `/grant/${resolvedParams.id}/${resolvedParams.slug}`,
  });
}

export default async function GrantPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const work = await getGrant(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  const content = await getWorkHTMLContent(work);

  return (
    <PageLayout rightSidebar={<GrantRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <GrantDocument work={work} metadata={metadata} content={content} defaultTab="paper" />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} tab="paper" />
      </Suspense>
    </PageLayout>
  );
}
