import { PaperService } from '@/services/paper.service';
import { redirect } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';

type Props = {
  params: Promise<Record<string, never>>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function WorkPage({ params, searchParams }: Props) {
  const searchParamsData = await searchParams;
  const doi = searchParamsData.doi;
  if (!doi || typeof doi !== 'string') {
    redirect('/404');
  }

  try {
    // This will show loading state in @loading slot while fetching
    const work = await PaperService.get(doi);
    redirect(buildWorkUrl(work.id, work.title));
  } catch (error: any) {
    if (!error.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Error importing work:', error);
      redirect('/404');
    }
    throw error; // Re-throw Next.js redirects
  }
}
