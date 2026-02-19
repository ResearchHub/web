import { getGrant, getWorkHTMLContent } from '@/app/grant/[id]/[slug]/GrantPageServer';
import { FundingGrantPageClient } from './FundingGrantPageClient';

interface FundingGrantPageServerProps {
  grantId: string;
  initialTab?: 'proposals' | 'details';
}

export async function FundingGrantPageServer({
  grantId,
  initialTab = 'proposals',
}: FundingGrantPageServerProps) {
  const work = await getGrant(grantId);
  const htmlContentPromise = getWorkHTMLContent(work);

  return (
    <FundingGrantPageClient
      work={work}
      htmlContentPromise={htmlContentPromise}
      initialTab={initialTab}
    />
  );
}
