import { getProposalOrNotFound } from '@/components/work/proposalRouteServer';
import { handleMissingSlugRedirect } from '@/utils/navigation';
import { createUrlSearchParams, type NextSearchParams } from '@/utils/registeredReportRoute';

interface Props {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<NextSearchParams>;
}

export default async function FundRedirectPage({ params, searchParams }: Props) {
  const [{ id }, resolvedSearchParams] = await Promise.all([params, searchParams]);

  // Any share token in the query string is carried through the redirect, so a
  // slugless share link still lands on a page that can read it.
  const fund = await getProposalOrNotFound(id);

  // Redirect to the full URL with slug (outside try-catch)
  handleMissingSlugRedirect(fund, id, 'proposal', createUrlSearchParams(resolvedSearchParams));
}
