import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingRightSidebar } from '@/components/work/FundingRightSidebar';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { GrantDocument } from '@/components/work/GrantDocument';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getGrant(id: string): Promise<Work> {
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const grant = await getGrant(resolvedParams.id);
  return {
    title: grant.title,
    description: grant.abstract || '',
  };
}

export default async function GrantPage({ params }: Props) {
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const work = await getGrant(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <PageLayout rightSidebar={<FundingRightSidebar work={work} metadata={metadata} />}>
      <Suspense>
        <GrantDocument work={work} metadata={metadata} defaultTab="paper" />
        <SearchHistoryTracker work={work} />
      </Suspense>
    </PageLayout>
  );
}
