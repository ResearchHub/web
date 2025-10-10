import { Skeleton } from '@/components/ui/Skeleton';

interface TopicListSkeletonProps {
  count?: number;
  variant?: 'default' | 'compact';
}

export function TopicListSkeleton({ count = 50, variant = 'default' }: TopicListSkeletonProps) {
  if (variant === 'compact') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-16 flex items-center p-4 gap-3"
          >
            {/* Icon placeholder */}
            <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />

            {/* Text placeholder */}
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-28"
        >
          <div className="p-5 w-full h-full flex flex-col">
            <div className="flex items-start justify-between mb-3">
              {/* Icon placeholder */}
              <Skeleton className="h-10 w-10 rounded-md" />

              {/* Follow button placeholder */}
            </div>

            {/* Topic name placeholder */}
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}
