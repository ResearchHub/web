import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ChangelogEntry } from '@/components/changelog/ChangelogEntry';
import { notFound } from 'next/navigation';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';
import { CHANGELOG_POST_IDS } from '@/constants/changelog';

export const metadata = buildOpenGraphMetadata({
  title: 'Changelog',
  description: 'Stay updated with the latest ResearchHub product updates and improvements.',
  url: '/changelog',
});

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
  const postsWithContent = await Promise.all(
    CHANGELOG_POST_IDS.map((id) => fetchPostWithContent(id))
  );

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
    <PageLayout rightSidebar={false}>
      <div className="py-8">
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
    </PageLayout>
  );
}
