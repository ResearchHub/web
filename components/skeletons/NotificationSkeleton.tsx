import { Skeleton } from '@/components/ui/Skeleton';

interface NotificationSkeletonListProps {
  count?: number;
}

export function NotificationSkeleton() {
  return (
    <div className="flex items-center gap-3 py-4 pl-2.5 pr-4">
      <span className="w-2 flex-shrink-0" aria-hidden />
      <Skeleton className="h-8 w-8 flex-shrink-0 rounded-full" />

      <div className="ml-1 min-w-0 flex-1 space-y-2">
        <Skeleton className="h-3.5 w-40 max-w-full" />
        <Skeleton className="h-3 w-[85%]" />
      </div>

      <Skeleton className="h-3 w-12 flex-shrink-0" />
    </div>
  );
}

export function NotificationSkeletonList({ count = 10 }: Readonly<NotificationSkeletonListProps>) {
  return (
    <div className="divide-y divide-gray-100 overflow-hidden rounded-xl bg-white ring-1 ring-gray-200">
      {Array.from({ length: count }).map((_, skeletonIndex) => (
        <NotificationSkeleton key={'notification-skeleton-' + skeletonIndex} />
      ))}
    </div>
  );
}
