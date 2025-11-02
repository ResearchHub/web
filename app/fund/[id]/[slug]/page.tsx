import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { CommentService } from '@/services/comment.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingRightSidebar } from '@/components/work/FundingRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { FundDocument } from '@/components/work/FundDocument';
import { getWorkMetadata } from '@/lib/metadata-helpers';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getFundingProject(id: string): Promise<Work> {
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

async function getWorkHTMLContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getFundingProject(resolvedParams.id);

  return getWorkMetadata({
    work: project,
    url: `/fund/${resolvedParams.id}/${resolvedParams.slug}`,
  });
}

export default async function FundingProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // First fetch the work to get the unifiedDocumentId
  const work = await getFundingProject(id);

  // Fetch all required data in parallel
  const [metadata, content, authorUpdates] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    getWorkHTMLContent(work),
    CommentService.fetchAuthorUpdates({
      documentId: work.id,
      contentType: work.contentType,
    }),
  ]);

  return (
    <PageLayout
      rightSidebar={
        <FundingRightSidebar work={work} metadata={metadata} authorUpdates={authorUpdates} />
      }
    >
      <Suspense>
        <FundDocument
          work={work}
          metadata={metadata}
          content={content}
          defaultTab="paper"
          authorUpdates={authorUpdates}
        />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} tab="paper" />
      </Suspense>
    </PageLayout>
  );
}
