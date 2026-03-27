import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { handleMissingSlugRedirect } from '@/utils/navigation';
import { isLikelySpamGrantWork } from '@/utils/grantSpamDetection';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function GrantRedirectPage({ params }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let grant;
  try {
    grant = await PostService.get(id);
    if (isLikelySpamGrantWork(grant)) {
      notFound();
    }
  } catch {
    notFound();
  }

  handleMissingSlugRedirect(grant, id, 'grant');
}
