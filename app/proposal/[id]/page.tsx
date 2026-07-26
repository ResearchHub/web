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

export default async function FundRedirectPage({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const id = resolvedParams.id;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let fund;
  try {
    fund = await PostService.get(id);
  } catch (error) {
    notFound();
  }

  // Redirect to the full URL with slug (outside try-catch)
  handleMissingSlugRedirect(fund, id, 'proposal', createUrlSearchParams(resolvedSearchParams));
}
