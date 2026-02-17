import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { FundingGrantPageClient } from './FundingGrantPageClient';

interface FundingGrantPageProps {
  params: Promise<{
    grantId: string;
  }>;
}

async function getGrantWork(grantId: string): Promise<Work> {
  if (!grantId.match(/^\d+$/)) {
    notFound();
  }

  try {
    const work = await PostService.get(grantId);
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

export default async function FundingGrantPage({ params }: FundingGrantPageProps) {
  const { grantId } = await params;
  const work = await getGrantWork(grantId);
  const htmlContent = await getWorkHTMLContent(work);

  return (
    <Suspense
      fallback={
        <div className="animate-pulse">
          <div className="h-48 bg-gray-200 rounded-xl mb-8" />
          <div className="h-8 bg-gray-200 rounded w-32 mb-4" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
            <div className="h-64 bg-gray-200 rounded-xl" />
          </div>
        </div>
      }
    >
      <FundingGrantPageClient work={work} htmlContent={htmlContent} />
    </Suspense>
  );
}
