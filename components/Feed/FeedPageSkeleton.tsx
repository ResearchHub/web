import { FeedItemSkeleton } from './FeedItemSkeleton';
import { FeedTab } from '@/hooks/useFeed';

function FeedTabsSkeleton() {
  return (
    <div className="flex items-center gap-2 animate-pulse overflow-hidden">
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="h-8 w-24 rounded-full bg-gray-200 flex-shrink-0" />
      ))}
    </div>
  );
}

function ForYouFeedBannerSkeleton() {
  return (
    <div className="relative flex flex-col sm:!flex-row sm:!items-center gap-2.5 bg-indigo-50/80 rounded-lg px-3 py-2.5 border-2 border-primary-100 mb-2 animate-pulse">
      <div className="flex items-start sm:!items-center gap-2.5 flex-1 min-w-0">
        <div className="w-5 h-5 bg-gray-200 rounded flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <div className="h-4 w-48 max-w-full bg-gray-200 rounded" />
          <div className="h-3 w-64 max-w-full bg-gray-200 rounded" />
        </div>
      </div>
      <div className="h-9 w-full sm:!w-24 bg-gray-200 rounded-md flex-shrink-0" />
    </div>
  );
}

function FeedTabsRowSkeleton({ showFollowingSort = false }: { showFollowingSort?: boolean }) {
  return (
    <div className="h-full">
      <div className="flex items-center justify-between gap-2 h-full">
        <div className="min-w-0 flex-1">
          <FeedTabsSkeleton />
        </div>
        {showFollowingSort && (
          <div className="h-4 w-10 bg-gray-200 rounded animate-pulse flex-shrink-0 hidden sm:block" />
        )}
      </div>
      {showFollowingSort && (
        <div className="flex justify-end sm:hidden mt-2 animate-pulse">
          <div className="h-4 w-10 bg-gray-200 rounded" />
        </div>
      )}
    </div>
  );
}

interface FeedPageSkeletonProps {
  tab?: FeedTab;
  skeletonCount?: number;
}

export function FeedPageSkeleton({ tab = 'popular', skeletonCount = 3 }: FeedPageSkeletonProps) {
  return (
    <div className="max-w-4xl mx-auto">
      {tab === 'for-you' && <ForYouFeedBannerSkeleton />}

      <FeedTabsRowSkeleton showFollowingSort={tab === 'following'} />

      <div className="mt-4">
        <div className="space-y-8">
          {Array.from({ length: skeletonCount }, (_, i) => (
            <FeedItemSkeleton key={i} showHeader={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
