import { PaperService } from '@/services/paper.service';
import { redirect } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function WorkIdPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id.match(/^\d+$/)) {
    redirect('/404');
  }

  try {
    const work = await PaperService.get(id);
    redirect(
      buildWorkUrl({
        id: work.id,
        contentType: 'paper',
        slug: work.title,
      })
    );
  } catch (error: any) {
    if (!error.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Error loading work:', error);
      redirect('/404');
    }
    throw error; // Re-throw Next.js redirects
  }
}
