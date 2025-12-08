import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ChangelogEntry } from '@/components/changelog/ChangelogEntry';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { SITE_CONFIG } from '@/lib/metadata';

export const metadata: Metadata = {
  title: 'Changelog | ResearchHub',
  description: 'Stay updated with the latest ResearchHub product updates and improvements.',
  openGraph: {
    title: 'Changelog | ResearchHub',
    description: 'Stay updated with the latest ResearchHub product updates and improvements.',
    url: `${SITE_CONFIG.url}/changelog`,
    type: 'website',
    images: [SITE_CONFIG.ogImage],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Changelog | ResearchHub',
    description: 'Stay updated with the latest ResearchHub product updates and improvements.',
    images: [SITE_CONFIG.ogImage],
  },
};

interface PostWithContent {
  work: Work;
  content?: string;
}

async function fetchPostWithContent(postId: string): Promise<PostWithContent | null> {
  try {
    const work = await PostService.get(postId);
    let content: string | undefined;

    if (work.contentUrl) {
      try {
        content = await PostService.getContent(work.contentUrl);
      } catch (error) {
        console.error(`Failed to fetch content for post ${postId}:`, error);
      }
    }

    return { work, content };
  } catch (error) {
    console.error(`Failed to fetch post ${postId}:`, error);
    return null;
  }
}

export default async function ChangelogPage() {
  // Post IDs for changelog entries
  const postIds = ['451', '451'];

  const postsWithContent = await Promise.all(postIds.map((id) => fetchPostWithContent(id)));

  const validPosts = postsWithContent
    .filter((post): post is PostWithContent => post !== null)
    .sort((a, b) => {
      const dateA = new Date(a.work.createdDate).getTime();
      const dateB = new Date(b.work.createdDate).getTime();
      return dateB - dateA;
    });

  if (validPosts.length === 0) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Changelog</h1>
        <p className="text-lg text-gray-600">
          Stay updated with the latest ResearchHub product updates and improvements.
        </p>
      </div>

      <div className="space-y-0">
        {validPosts.map(({ work, content }) => (
          <ChangelogEntry key={work.id} work={work} content={content} />
        ))}
      </div>
    </div>
  );
}
