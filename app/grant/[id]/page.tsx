import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { handleMissingSlugRedirect } from '@/utils/navigation';

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
  } catch {
    notFound();
  }

  handleMissingSlugRedirect(grant, id, 'grant');
}
