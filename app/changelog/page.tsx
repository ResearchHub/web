import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { ChangelogEntry } from '@/components/changelog/ChangelogEntry';
import { Button } from '@/components/ui/Button';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { PageLayout } from '@/app/layouts/PageLayout';

export const metadata = buildOpenGraphMetadata({
  title: 'Changelog',
  description: 'Stay updated with the latest ResearchHub product updates and improvements.',
  url: '/changelog',
});

interface ChangelogPageProps {
  searchParams: Promise<{ page?: string }>;
}

interface PostWithContent {
  work: Work;
  content?: string;
}

/** Older posts have no markdown and render from their HTML source file. */
async function withContent(work: Work): Promise<PostWithContent> {
  if (work.previewContent || !work.contentUrl) return { work };

  try {
    return { work, content: await PostService.getContent(work.contentUrl) };
  } catch (error) {
    console.error(`Failed to fetch content for post ${work.id}:`, error);
    return { work };
  }
}

const pageHref = (page: number) => (page > 1 ? `/changelog?page=${page}` : '/changelog');

export default async function ChangelogPage({ searchParams }: Readonly<ChangelogPageProps>) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number.parseInt(pageParam ?? '1', 10) || 1);

  let changelog;
  try {
    changelog = await PostService.getChangelog({ page });
  } catch (error) {
    console.error('Failed to fetch changelog:', error);
    notFound();
  }

  if (changelog.entries.length === 0) {
    notFound();
  }

  const postsWithContent = await Promise.all(changelog.entries.map(withContent));

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
          {postsWithContent.map(({ work, content }) => (
            <ChangelogEntry key={work.id} work={work} content={content} />
          ))}
        </div>

        {(page > 1 || changelog.hasMore) && (
          <nav className="flex justify-between gap-4 pt-8 border-t border-gray-200">
            {page > 1 ? (
              <Button asChild variant="outlined">
                <Link href={pageHref(page - 1)}>Newer updates</Link>
              </Button>
            ) : (
              <span />
            )}
            {changelog.hasMore && (
              <Button asChild variant="outlined">
                <Link href={pageHref(page + 1)}>Older updates</Link>
              </Button>
            )}
          </nav>
        )}
      </div>
    </PageLayout>
  );
}
