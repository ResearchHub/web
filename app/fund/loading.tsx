import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FundLoading() {
  return (
    <PageLayout rightSidebar={<ActivitySidebarSkeleton />}>
      <div>
        {/* FundingIntroBanner placeholder */}
        <div className="mb-4 rounded-xl p-[1.5px]">
          <div className="rounded-[10px] bg-primary-50 animate-pulse">
            <div className="grid grid-cols-[1fr_1fr] items-center px-6 py-4">
              <div className="flex items-center gap-3 pr-6">
                <div className="w-10 h-10 rounded-full bg-primary-200/60" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-primary-200/60 rounded" />
                  <div className="h-3 w-40 bg-primary-200/60 rounded" />
                </div>
              </div>
              <div className="flex items-center gap-3 pl-6">
                <div className="w-10 h-10 rounded-full bg-primary-200/60" />
                <div className="space-y-2">
                  <div className="h-4 w-20 bg-primary-200/60 rounded" />
                  <div className="h-3 w-36 bg-primary-200/60 rounded" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ProposalSortAndFilters placeholder */}
        <div className="flex items-center justify-between mt-10">
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
