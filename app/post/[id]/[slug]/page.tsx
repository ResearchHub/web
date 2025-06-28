import { Suspense } from 'react';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/app/layouts/PageLayout';
import { WorkDocument } from '@/components/work/WorkDocument';
import { WorkRightSidebar } from '@/components/work/WorkRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { PostDocument } from '@/components/work/PostDocument';
import { handleFundraiseRedirect } from '@/utils/navigation';
import { buildArticleMetadata, SITE_CONFIG } from '@/lib/metadata';
import { truncateText } from '@/utils/stringUtils';
import { generateDocumentStructuredData } from '@/lib/structured-data';

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

  // Get content for better description
  const content = await getPostContent(post);
  const description = content
    ? truncateText(content.replace(/<[^>]*>/g, ''), 65)
    : truncateText(post.abstract || post.title, 65);

  // Use custom image if available, otherwise generate dynamic OG image
  const ogImage =
    post.image ||
    `${SITE_CONFIG.url}/api/og?title=${encodeURIComponent(post.title)}&description=${encodeURIComponent(description)}&author=${encodeURIComponent(post.authors?.[0]?.authorProfile?.fullName || '')}`;

  const structuredData = generateDocumentStructuredData({
    ...post,
    authors: post.authors?.map((a) => ({
      name: a.authorProfile?.fullName || '',
      url: a.authorProfile?.profileUrl,
    })),
  });

  return {
    ...buildArticleMetadata({
      title: post.title,
      description,
      url: `/post/${resolvedParams.id}/${resolvedParams.slug}`,
      image: ogImage,
      publishedTime: post.createdDate,
      authors: post.authors?.map((author) => author.authorProfile?.fullName) || [],
      tags: post.topics?.map((topic) => topic.name) || [],
    }),
    // Practice #10: Fallback structured data
    ...(structuredData && {
      other: {
        'application/ld+json': JSON.stringify(structuredData),
      },
    }),
  };
}

export default async function PostPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  // First fetch the post
  const post = await getPost(id);

  // Handle fundraise redirection
  handleFundraiseRedirect(post, resolvedParams.id, resolvedParams.slug);

  // Then fetch metadata using unifiedDocumentId
  const metadata = await MetadataService.get(post.unifiedDocumentId?.toString() || '');

  // Fetch content if available
  const content = await getPostContent(post);

  if (!post) {
    notFound();
  }

  return (
    <PageLayout rightSidebar={<WorkRightSidebar work={post} metadata={metadata} />}>
      <Suspense>
        {content ? (
          <PostDocument work={post} metadata={metadata} content={content} defaultTab="paper" />
        ) : (
          <WorkDocument work={post} metadata={metadata} defaultTab="paper" />
        )}
        <SearchHistoryTracker work={post} />
      </Suspense>
    </PageLayout>
  );
}
