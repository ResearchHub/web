import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { PostService } from '@/services/post.service';
import { PageLayout } from '@/app/layouts/PageLayout';
import { FundingProposalGrid } from '@/components/Funding/FundingProposalGrid';
import { GrantDetailsCallout } from '@/components/Funding/GrantDetailsCallout';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FundingSidebarServer } from '@/components/Funding/FundingSidebarServer';
import { TotalFundingSection } from '@/components/Funding/TotalFundingSection';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { GrantService } from '@/services/grant.service';

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

  const grantId = work.note?.post?.grant?.id;
  const { usd } = await GrantService.getAvailableFunding();

  return (
    <PageLayout
      rightSidebar={
        <Suspense fallback={<ActivitySidebarSkeleton />}>
          <FundingSidebarServer
            topSection={<TotalFundingSection totalUsd={usd} />}
            grantId={grantId as number}
          />
        </Suspense>
      }
      scrollContainerClassName="pt-[108px]"
    >
      <div className="py-4">
        {work.previewContent ? (
          <GrantDetailsCallout content={work.previewContent} />
        ) : (
          <p className="mt-4 text-gray-500">No content available</p>
        )}

        <FundraiseProvider grantId={grantId ? Number(grantId) : undefined}>
          <FundingProposalGrid className="mt-6" />
        </FundraiseProvider>
      </div>
    </PageLayout>
  );
}
