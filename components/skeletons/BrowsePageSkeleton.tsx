import { Skeleton } from '@/components/ui/Skeleton';
import { TopicListSkeleton } from './TopicListSkeleton';

export function BrowsePageSkeleton() {
  return (
    <div>
      {/* Header section skeleton */}
      <div className="px-0 py-6 mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Title skeleton */}
          <Skeleton className="h-9 w-32 mb-6" />

          {/* Search and tabs row */}
          <div className="flex flex-col lg:!flex-row gap-4 items-start lg:!items-center justify-between">
            {/* Search box skeleton */}
            <div className="w-full lg:!w-96 order-2 lg:!order-1">
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>

            {/* Tab buttons skeleton */}
            <div className="order-1 lg:!order-2 flex-shrink-0">
              <div className="flex gap-2 p-1 border border-gray-300 bg-white rounded-lg">
                <Skeleton className="h-9 w-28 rounded-md" />
                <Skeleton className="h-9 w-28 rounded-md" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Topics list skeleton */}
      <div className="py-4 max-w-7xl mx-auto">
        <TopicListSkeleton count={50} variant="default" />
      </div>
    </div>
  );
}
