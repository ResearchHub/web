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
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { handleFundraiseRedirect } from '@/utils/navigation';
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
    url: `/question/${resolvedParams.id}/${resolvedParams.slug}/conversation`,
    titleSuffix: 'Conversation',
  });
}

export default async function QuestionConversationPage({ params }: Props) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.id);

  // Handle fundraise redirection
  handleFundraiseRedirect(post, resolvedParams.id, resolvedParams.slug);

  const metadata = await MetadataService.get(post.unifiedDocumentId);
  const content = await getPostContent(post);

  if (!post) {
    notFound();
  }

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={post} metadata={metadata} />}>
      <Suspense>
        {content ? (
          <PostDocument
            work={post}
            metadata={metadata}
            content={content}
            defaultTab="conversation"
          />
        ) : (
          <PostDocument work={post} metadata={metadata} defaultTab="conversation" />
        )}
        <SearchHistoryTracker work={post} />
        <WorkDocumentTracker work={post} metadata={metadata} tab="conversation" />
      </Suspense>
    </PageLayout>
  );
}
