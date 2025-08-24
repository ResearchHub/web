import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { handleMissingSlugRedirect } from '@/utils/navigation';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function GrantRedirectPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let grant;
  try {
    grant = await PostService.get(id);
  } catch (error) {
    notFound();
  }

  // Redirect to the full URL with slug (outside try-catch)
  handleMissingSlugRedirect(grant, id, 'grant');
}
