import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';

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
    title: project.title,
    description: project.abstract || '',
  };
}

export default async function FundingProjectPage({ params }: Props) {
  const resolvedParams = await params;
  const work = await getFundingProject(resolvedParams.id);
  const content = await getWorkHTMLContent(work);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{work.title}</h1>

      {/* Debug section */}
      <details className="mb-8">
        <summary className="cursor-pointer text-gray-600">Debug Info</summary>
        <pre className="bg-gray-100 p-4 rounded-lg overflow-auto mt-2">
          {JSON.stringify(work, null, 2)}
        </pre>
      </details>

      {/* Content section */}
      {content ? (
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
      ) : work.previewContent ? (
        <div className="prose max-w-none whitespace-pre-wrap">{work.previewContent}</div>
      ) : (
        <p className="text-gray-500">No content available</p>
      )}
    </div>
  );
}
