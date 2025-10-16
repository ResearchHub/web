import { Skeleton } from '@/components/ui/Skeleton';
import { TopicListSkeleton } from './TopicListSkeleton';

export function BrowsePageSkeleton() {
  return (
    <div>
      <div className="px-0 py-6 mb-6">
        <div className="max-w-7xl mx-auto">
          {/* Title skeleton */}
          <Skeleton className="h-9 w-32 mb-6" />

          <div className="flex flex-col lg:!flex-row gap-4 items-start lg:!items-center justify-between">
            {/* Search bar skeleton */}
            <div className="w-full lg:!w-96 order-2 lg:!order-1">
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>

            {/* Tab button group skeleton */}
            <div className="order-1 lg:!order-2 flex-shrink-0">
              <Skeleton className="h-10 w-64 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* Topic list skeleton */}
      <div className="py-4 max-w-7xl mx-auto">
        <TopicListSkeleton />
      </div>
    </div>
  );
}
