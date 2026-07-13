interface NotificationSkeletonListProps {
  count?: number;
}

export function NotificationSkeleton() {
  return (
    <div className="flex animate-pulse items-start gap-3 border-b border-gray-200 px-4 py-4">
      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-200" />

      <div className="min-w-0 flex-1">
        <div className="h-4 w-32 rounded bg-gray-200" />

        <div className="mt-0.5 space-y-1.5">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-[85%] rounded bg-gray-200" />
        </div>

        <div className="mt-1 h-3 w-16 rounded bg-gray-200" />
      </div>

      <div className="flex flex-shrink-0 items-center self-center">
        <div className="h-4 w-4 rounded bg-gray-200" />
      </div>
    </div>
  );
}

export function NotificationSkeletonList({ count = 10 }: NotificationSkeletonListProps) {
  return (
    <div>
      {Array.from({ length: count }, (_, index) => (
        <NotificationSkeleton key={`notification-skeleton-${index}`} />
      ))}
    </div>
  );
}
