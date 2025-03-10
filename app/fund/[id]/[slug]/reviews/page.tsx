import { Suspense } from 'react';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundDocument } from '@/components/work/FundDocument';
import { FundingRightSidebar } from '@/components/work/FundingRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';

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
  return {
    title: `${project.title} - Reviews`,
    description: project.abstract || '',
  };
}

export default async function FundReviewsPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // First fetch the work to get the unifiedDocumentId
  const work = await getFundingProject(id);

  // Then fetch metadata using unifiedDocumentId
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  // Only fetch content after we have the work object with contentUrl
  const content = await getWorkHTMLContent(work);

  return (
    <PageLayout rightSidebar={<FundingRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <FundDocument work={work} metadata={metadata} content={content} defaultTab="reviews" />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
