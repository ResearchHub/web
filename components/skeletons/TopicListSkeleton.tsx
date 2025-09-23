import { Skeleton } from '@/components/ui/Skeleton';

interface TopicListSkeletonProps {
  count?: number;
}

export function TopicListSkeleton({ count = 50 }: TopicListSkeletonProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="group transition-all duration-200 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm h-20"
        >
          <div className="p-4 h-full">
            <div className="flex items-center justify-between gap-4 h-full">
              {/* Text placeholder */}
              <Skeleton className="h-5 w-full max-w-[180px]" />

              {/* Follow button placeholder */}
              <Skeleton className="h-9 w-24 flex-shrink-0" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
