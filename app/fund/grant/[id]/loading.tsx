import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function FundGrantLoading() {
  return (
    <PageLayout rightSidebar={<ActivitySidebarSkeleton />}>
      <div>
        {/* GrantInfoBanner placeholder */}
        <div className="w-full rounded-xl bg-primary-50 p-3 mb-8 animate-pulse">
          <div className="flex flex-col px-1 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-5 w-28 bg-primary-200/60 rounded" />
              <div className="h-5 w-14 bg-primary-200/60 rounded-md" />
            </div>
            <div className="space-y-2">
              <div className="h-3.5 w-full bg-primary-200/60 rounded" />
              <div className="h-3.5 w-5/6 bg-primary-200/60 rounded" />
              <div className="h-3.5 w-2/3 bg-primary-200/60 rounded" />
            </div>
            <div className="h-4 w-24 bg-primary-200/60 rounded" />
            <div className="border-t border-primary-200 pt-2.5 flex justify-end">
              <div className="h-9 w-32 bg-primary-200/60 rounded-lg" />
            </div>
          </div>
        </div>

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
