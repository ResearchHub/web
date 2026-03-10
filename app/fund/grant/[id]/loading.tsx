import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

function BannerSkeleton() {
  return (
    <div className="w-full bg-gray-50/80 border-b border-gray-200 animate-pulse">
      <div className="max-w-[1180px] mx-auto pl-4 tablet:!pl-8 pr-4 tablet:!pr-0 py-5">
        <div className="mb-1.5">
          <div className="h-6 w-16 bg-gray-200/60 rounded-md" />
        </div>
        <div className="flex items-start gap-6">
          <div className="flex-1 space-y-2">
            <div className="h-9 w-80 bg-gray-200/60 rounded" />
            <div className="h-4 w-40 bg-gray-200/40 rounded" />
          </div>
          <div className="flex-shrink-0 flex flex-col gap-2">
            <div className="h-12 w-44 bg-gray-200/60 rounded-lg" />
            <div className="h-12 w-44 bg-gray-200/40 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function FundGrantLoading() {
  return (
    <PageLayout topBanner={<BannerSkeleton />} rightSidebar={<ActivitySidebarSkeleton />}>
      <div>
        {/* ProposalSortAndFilters placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-52 rounded bg-gray-200 animate-pulse" />
          <div className="h-5 w-24 rounded bg-gray-200 animate-pulse" />
        </div>

        {/* Feed skeletons */}
        <div className="mt-4 space-y-8">
          {Array.from({ length: 3 }, (_, i) => (
            <FeedItemSkeleton key={i} />
          ))}
        </div>
      </div>
    </PageLayout>
  );
}
