import { Metadata } from 'next';
import { MetadataService } from '@/services/metadata.service';
import { WorkDocument } from '@/components/work/WorkDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { getPaper } from '@/app/paper/getPaper';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id, slug } = await params;
  const work = await getPaper(id);

  return getWorkMetadata({
    work,
    url: `/paper/${id}/${slug}/bounties`,
    titleSuffix: 'Bounties',
  });
}

export default async function PaperBountiesPage({ params }: Props) {
  const { id } = await params;
  const work = await getPaper(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <>
      <WorkDocument work={work} metadata={metadata} />
      <SearchHistoryTracker work={work} />
      <WorkDocumentTracker work={work} metadata={metadata} tab="bounties" />
    </>
  );
}
