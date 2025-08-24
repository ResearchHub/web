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
  if (!work.contentUrl) {
    console.log('[getWorkHTMLContent] No content URL available');
    return undefined;
  }

  console.log('[getWorkHTMLContent] Fetching content from:', work.contentUrl);
  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('[getWorkHTMLContent] Failed to fetch content:', error);
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
  console.log('[FundingProjectPage] Starting render');
  const resolvedParams = await params;
  const id = resolvedParams.id;
  console.log('[FundingProjectPage] ID:', id);

  // First fetch the work to get the unifiedDocumentId
  console.log('[FundingProjectPage] Fetching funding project...');
  const work = await getFundingProject(id);
  console.log('[FundingProjectPage] Work fetched:', work.id, work.title);

  // Fetch all required data in parallel
  console.log('[FundingProjectPage] Starting parallel fetches...');
  const startTime = Date.now();
  const [metadata, content, authorUpdates] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || '').then((result) => {
      console.log('[FundingProjectPage] Metadata fetched in', Date.now() - startTime, 'ms');
      return result;
    }),
    getWorkHTMLContent(work).then((result) => {
      console.log('[FundingProjectPage] Content fetched in', Date.now() - startTime, 'ms');
      return result;
    }),
    CommentService.fetchAuthorUpdates({
      documentId: work.id,
      contentType: work.contentType,
    }).then((result) => {
      console.log('[FundingProjectPage] Author updates fetched in', Date.now() - startTime, 'ms');
      return result;
    }),
  ]);
  console.log('[FundingProjectPage] All data fetched in', Date.now() - startTime, 'ms');

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
      </Suspense>
    </PageLayout>
  );
}
