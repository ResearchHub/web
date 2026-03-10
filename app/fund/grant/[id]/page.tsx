import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';

import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { isDeadlineInFuture } from '@/utils/date';
import { GrantTabProvider } from '@/components/Funding/GrantPageContent';
import { GrantBannerWithTabs } from '@/components/Funding/GrantBannerWithTabs';
import { GrantContentSwitcher } from '@/components/Funding/GrantContentSwitcher';

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default async function FundGrantPage({ params }: Props) {
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
  const amountUsd = grant?.amount?.usd;
  const grantTitle = grant?.shortTitle || work.title;
  const isActive =
    grant?.status === 'OPEN' && (grant?.endDate ? isDeadlineInFuture(grant.endDate) : true);

  return (
    <GrantTabProvider>
      <PageLayout
        topBanner={
          <GrantBannerWithTabs
            amountUsd={amountUsd}
            grantId={grantId?.toString()}
            isActive={isActive}
            work={work}
            organization={grant?.organization}
          />
        }
        rightSidebar={
          <Suspense fallback={<ActivitySidebarSkeleton />}>
            <FundingSidebarServer grantId={grantId} grantTitle={grantTitle} />
          </Suspense>
        }
      >
        <GrantContentSwitcher
          content={work.previewContent}
          imageUrl={work.image}
          hasDescription={!!grant?.description}
          grantId={grantId}
        >
          <FundraiseProvider grantId={grantId ? Number(grantId) : undefined}>
            {grant?.description && <ProposalSortAndFilters variant="grant" />}
            <ProposalFeed />
          </FundraiseProvider>
        </GrantContentSwitcher>
      </PageLayout>
    </GrantTabProvider>
  );
}
