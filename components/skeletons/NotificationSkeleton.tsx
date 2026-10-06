import { cn } from '@/utils/styles';

interface NotificationSkeletonListProps {
  count?: number;
  /** Wrap the rows in the rounded list box. Turn off when rendering inside an existing box. */
  framed?: boolean;
}

export function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-4 p-4">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />

      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-40 max-w-full rounded bg-gray-200" />
        <div className="h-3 w-[85%] rounded bg-gray-100" />
      </div>

      <div className="h-3 w-12 flex-shrink-0 rounded bg-gray-100" />
    </div>
  );
}

export function NotificationSkeletonList({
  count = 10,
  framed = true,
}: NotificationSkeletonListProps) {
  return (
    <div
      className={cn(
        'divide-y divide-gray-100',
        framed && 'overflow-hidden rounded-xl bg-white ring-1 ring-gray-200'
      )}
    >
      {Array.from({ length: count }, (_, index) => (
        <NotificationSkeleton key={`notification-skeleton-${index}`} />
      ))}
    </div>
  );
}
