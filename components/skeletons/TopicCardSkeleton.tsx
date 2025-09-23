import { Skeleton } from '@/components/ui/Skeleton';

export function TopicCardSkeleton() {
  return (
    <div className="group transition-all duration-200 overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="p-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Emoji placeholder */}
            <div className="w-8 h-8 rounded bg-gray-200 animate-pulse flex-shrink-0" />

            {/* Title placeholder */}
            <Skeleton className="h-4 w-full max-w-[150px]" />
          </div>

          {/* Follow button placeholder */}
          <Skeleton className="h-8 w-20 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}
