import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { handleMissingSlugRedirect } from '@/utils/navigation';
import { createUrlSearchParams, type NextSearchParams } from '@/utils/registeredReportRoute';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<NextSearchParams>;
}

export default async function GrantRedirectPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let grant;
  try {
    grant = await PostService.get(id);
  } catch {
    notFound();
  }

  handleMissingSlugRedirect(grant, id, 'grant', createUrlSearchParams(resolvedSearchParams));
}
