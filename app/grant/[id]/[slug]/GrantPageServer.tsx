import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { Work } from '@/types/work';
import { PageLayout } from '@/app/layouts/PageLayout';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { GrantDocument } from '@/components/work/GrantDocument';
import { GrantInfoBanner } from '@/components/Funding/GrantInfoBanner';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { isDeadlineInFuture } from '@/utils/date';

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
  const grant = work.note?.post?.grant;
  const grantId = grant?.id ?? undefined;
  const grantTitle = grant?.shortTitle || work.title;
  const isActive =
    grant?.status === 'OPEN' && (grant?.endDate ? isDeadlineInFuture(grant.endDate) : true);

  const banner = (
    <GrantInfoBanner
      amountUsd={grant?.amount?.usd}
      grantId={grantId?.toString()}
      isActive={isActive}
      work={work}
      organization={grant?.organization}
      description={grant?.description}
      content={work.previewContent}
      imageUrl={work.image}
    />
  );

  return (
    <PageLayout
      topBanner={banner}
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer grantId={grantId} grantTitle={grantTitle} />
        </Suspense>
      }
    >
      <Suspense>
        <GrantDocument work={work} metadata={metadata} />
        <SearchHistoryTracker work={work} />
        <WorkDocumentTracker work={work} metadata={metadata} />
      </Suspense>
    </PageLayout>
  );
}
