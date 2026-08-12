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

  const fund = await getProposalOrNotFound(id);

  handleMissingSlugRedirect(fund, id, 'proposal', createUrlSearchParams(resolvedSearchParams));
}
