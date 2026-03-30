import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { FundDocument } from '@/components/work/FundDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { getWorkMetadata } from '@/lib/metadata-helpers';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getFundingProject(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    const work = await PostService.get(id);
    return work;
  } catch (error) {
    notFound();
  }
}

async function getWorkHTMLContent(work: Work): Promise<string | undefined> {
  if (!work.contentUrl) return undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch content:', error);
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const project = await getFundingProject(resolvedParams.id);

  return getWorkMetadata({
    work: project,
    url: `/proposal/${resolvedParams.id}/${resolvedParams.slug}/bounties`,
    titleSuffix: 'Bounties',
  });
}

export default async function FundBountiesPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const work = await getFundingProject(id);

  const [metadata, content] = await Promise.all([
    MetadataService.get(work.unifiedDocumentId?.toString() || ''),
    getWorkHTMLContent(work),
  ]);

  return (
    <>
      <FundDocument work={work} metadata={metadata} content={content} />
      <SearchHistoryTracker work={work} />
      <WorkDocumentTracker work={work} metadata={metadata} tab="bounties" />
    </>
  );
}
