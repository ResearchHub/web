import { PaperService } from '@/services/paper.service';
import { redirect } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';
import { generateSlug } from '@/utils/url';

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
    const slug = generateSlug(work.title);
    const currentPath = `/paper/${id}`;
    const targetPath = buildWorkUrl({
      id: work.id,
      contentType: 'paper',
      slug,
    });

    // Redirect if we're not on the canonical URL (with slug)
    if (currentPath !== targetPath) {
      redirect(targetPath);
    }

    return null;
  } catch (error: any) {
    if (!error.digest?.startsWith('NEXT_REDIRECT')) {
      console.error('Error loading work:', error);
      redirect('/404');
    }
    throw error; // Re-throw Next.js redirects
  }
}
