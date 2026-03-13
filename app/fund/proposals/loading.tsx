import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FundingBannerSkeleton } from '@/components/Funding/FundingBannerSkeleton';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FundProposalsLoading() {
  return (
    <PageLayout topBanner={<FundingBannerSkeleton />} rightSidebar={<ActivitySidebarSkeleton />}>
      <div>
        <div className="flex items-center justify-between mt-6 mb-2">
          <div className="h-5 w-52 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        </div>

        <div className="mt-4 space-y-8">
          {Array.from({ length: 3 }, (_, i) => (
            <FeedItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
