import { PageLayout } from '@/app/layouts/PageLayout';
import { ActivitySidebarSkeleton } from '@/components/Funding/ActivitySidebarSkeleton';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';

export default function EarnLoading() {
  return (
    <PageLayout rightSidebar={<ActivitySidebarSkeleton />}>
      <div>
        {/* EarnSectionCards placeholder */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2 mb-10">
          {Array.from({ length: 2 }, (_, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-gray-200 rounded shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-40 bg-gray-200 rounded" />
                  <div className="h-3.5 w-56 bg-gray-200 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GrantSortAndFilters placeholder */}
        <div className="flex items-center justify-between">
          <div className="h-5 w-32 rounded bg-gray-200 animate-pulse" />
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
