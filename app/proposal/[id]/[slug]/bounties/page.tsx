import { Metadata } from 'next';
import { FundDocument } from '@/components/work/FundDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import {
  buildProposalMetadata,
  getProposalContent,
  getProposalMetadata,
  getProposalOrNotFound,
} from '@/components/work/proposalRouteServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  return buildProposalMetadata({ id, slug, tab: 'bounties', titleSuffix: 'Bounties' });
}

export default async function FundBountiesPage({ params }: Props) {
  const { id } = await params;

  const work = await getProposalOrNotFound(id);
  const [metadata, content] = await Promise.all([
    getProposalMetadata(work.unifiedDocumentId?.toString() || ''),
    getProposalContent(work),
  ]);

  return (
    <>
      <FundDocument work={work} metadata={metadata} content={content} />
      <SearchHistoryTracker work={work} />
      <WorkDocumentTracker work={work} metadata={metadata} tab="bounties" />
    </>
  );
}
