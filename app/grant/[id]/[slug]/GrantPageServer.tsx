import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { GrantDocument } from '@/components/work/GrantDocument';
import { GrantAmountSection } from '@/components/work/components/GrantAmountSection';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';

interface GrantPageServerProps {
  id: string;
}

export async function getGrant(id: string): Promise<Work> {
  if (!id.match(/^\d+$/)) {
    notFound();
  }

  try {
    return await PostService.get(id);
  } catch {
    notFound();
  }
}

export async function GrantPageServer({ id }: GrantPageServerProps) {
  const work = await getGrant(id);
  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');
  const grantId = work.note?.post?.grant?.id ?? undefined;

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer topSection={<GrantAmountSection work={work} />} grantId={grantId} />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <Suspense>
        <GrantDocument work={work} metadata={metadata} />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} />
      </Suspense>
    </PageLayout>
  );
}
