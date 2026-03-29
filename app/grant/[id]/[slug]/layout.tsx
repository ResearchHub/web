import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { MetadataService } from '@/services/metadata.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { isDeadlineInFuture } from '@/utils/date';
import { GrantTabProvider } from '@/components/Funding/GrantPageContent';
import { WorkHeaderGrant } from '@/components/work/WorkHeader/index';

interface Props {
  params: Promise<{
    id: string;
  }>;
  children: React.ReactNode;
}

export default async function GrantSlugLayout({ params, children }: Props) {
  const { id } = await params;

  if (!id.match(/^\d+$/)) {
    notFound();
  }

  let work;
  try {
    work = await PostService.get(id);
  } catch {
    notFound();
  }

  const grant = work.note?.post?.grant;
  const grantId = grant?.id ?? undefined;
  const grantTitle = grant?.shortTitle || work.title;
  const isPending = grant?.status === 'PENDING';
  const isActive =
    grant?.status === 'OPEN' && (grant?.endDate ? isDeadlineInFuture(grant.endDate) : true);

  const metadata = await MetadataService.get(work.unifiedDocumentId?.toString() || '');

  return (
    <GrantTabProvider defaultTab="details">
      <PageLayout
        topBanner={
          <WorkHeaderGrant
            work={work}
            metadata={metadata}
            amountUsd={grant?.amount?.usd}
            grantId={grantId?.toString()}
            isActive={isActive}
            isPending={isPending}
            organization={grant?.organization}
          />
        }
        rightSidebar={
          <Suspense fallback={<ActivitySidebarSkeleton />}>
            <FundingSidebarServer grantId={grantId} grantTitle={grantTitle} />
          </Suspense>
        }
      >
        {children}
      </PageLayout>
    </GrantTabProvider>
  );
}
