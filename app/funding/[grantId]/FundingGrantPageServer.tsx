import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { Work } from '@/types/work';
import { FundingGrantPageClient } from './FundingGrantPageClient';

interface FundingGrantPageServerProps {
  grantId: string;
  initialTab?: 'proposals' | 'details';
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

export async function FundingGrantPageServer({
  grantId,
  initialTab = 'proposals',
}: FundingGrantPageServerProps) {
  const work = await getGrantWork(grantId);
  const htmlContent = await getWorkHTMLContent(work);

  return <FundingGrantPageClient work={work} htmlContent={htmlContent} initialTab={initialTab} />;
}
