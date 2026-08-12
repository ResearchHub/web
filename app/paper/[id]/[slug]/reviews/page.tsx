import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { WorkDocument } from '@/components/work/WorkDocument';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { getWorkMetadata } from '@/lib/metadata-helpers';
import { getPaper, getDocumentMetadata } from '../data';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getWork(id: string) {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await getPaper(id);
  } catch (error) {
    notFound();
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const work = await getWork(resolvedParams.id);
  return getWorkMetadata({
    work: work,
    url: `/paper/${resolvedParams.id}/${resolvedParams.slug}/reviews`,
  });
}

export default async function WorkReviewsPage({ params }: Props) {
  const resolvedParams = await params;
  const work = await getWork(resolvedParams.id);
  const metadata = await getDocumentMetadata(work.unifiedDocumentId);

  if (!work) {
    notFound();
  }

  return (
    <>
      <WorkDocument work={work} metadata={metadata} />
      <SearchHistoryTracker work={work} />
      <WorkDocumentTracker work={work} metadata={metadata} tab="reviews" />
    </>
  );
}
