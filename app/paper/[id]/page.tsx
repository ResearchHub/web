import { notFound } from 'next/navigation';
import { PaperService } from '@/services/paper.service';
import { handleMissingSlugRedirect } from '@/utils/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function PaperRedirectPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let paper;
  try {
    paper = await PaperService.get(id);
  } catch (error) {
    notFound();
  }

  // Redirect to the full URL with slug (outside try-catch)
  handleMissingSlugRedirect(paper, id, 'paper');
}
