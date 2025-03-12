import { Suspense } from 'react';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { PostDocument } from '@/components/work/PostDocument';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getPost(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PostService.get(id);
  } catch (error) {
    notFound();
  }
}

async function getPostContent(work: Work): Promise<string | undefined> {
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
  const post = await getPost(resolvedParams.id);
  return {
    title: `${post.title} - Reviews`,
    description: post.abstract || '',
  };
}

export default async function PostReviewsPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);
  const metadata = await MetadataService.get(post.unifiedDocumentId?.toString() || '');
  const content = await getPostContent(post);

  if (!post) {
    notFound();
  }

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={post} metadata={metadata} />}>
      <Suspense>
        {content ? (
          <PostDocument work={post} metadata={metadata} content={content} defaultTab="reviews" />
        ) : (
          <PostDocument work={post} metadata={metadata} defaultTab="reviews" />
        )}
        <SearchHistoryTracker work={post} />
      </Suspense>
    </PageLayout>
  );
}
