import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkDocument } from '@/components/work/WorkDocument';
import { PostDocument } from '@/components/work/PostDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { getWorkMetadata } from '@/lib/metadata-helpers';

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

  return getWorkMetadata({
    work: post,
    url: `/question/${resolvedParams.id}/${resolvedParams.slug}`,
  });
}

export default async function QuestionPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  const metadata = await MetadataService.get(post.unifiedDocumentId?.toString() || '');
  const content = await getPostContent(post);

  if (!post) {
    notFound();
  }

  return (
    <>
      {content ? (
        <PostDocument work={post} metadata={metadata} content={content} />
      ) : (
        <WorkDocument work={post} metadata={metadata} />
      )}
      <SearchHistoryTracker work={post} />
      <WorkDocumentTracker work={post} metadata={metadata} tab="paper" />
    </>
  );
}
