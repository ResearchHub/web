import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalCount } from '@/components/Funding/ProposalCount';
import { FundingGrantTabs } from '@/components/Funding/FundingGrantTabs';
import { GrantInfoBanner } from '@/components/Funding/GrantInfoBanner';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { isDeadlineInFuture } from '@/utils/date';

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
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer grantId={grantId} grantTitle={grantTitle} />
        </Suspense>
      }
    >
      <div>
        <FundraiseProvider grantId={grantId ? Number(grantId) : undefined}>
          <FundingGrantTabs />
          {grant?.description ? (
            <>
              <GrantInfoBanner
                className="mt-4"
                description={grant.description}
                content={work.previewContent}
                amountUsd={amountUsd}
                grantId={grantId?.toString()}
                isActive={isActive}
                imageUrl={work.image}
              />
              <ProposalCount />
            </>
          ) : null}
          <ProposalFeed />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
