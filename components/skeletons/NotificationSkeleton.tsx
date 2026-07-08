interface NotificationSkeletonListProps {
  count?: number;
}

export function NotificationSkeleton() {
  return (
    <div className="group animate-pulse">
      <div className="relative py-3 px-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-2 flex-shrink-0 flex items-center justify-center self-center">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
            </div>
            <div className="ml-2 flex gap-3 items-center min-w-0 flex-1">
              <div className="w-[40px] h-[40px] bg-gray-200 rounded-full flex-shrink-0" />
              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 bg-gray-200 rounded-full w-20" />
                  <div className="h-5 bg-gray-200 rounded-full w-16" />
                </div>
                <div className="space-y-1.5">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-[88%]" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-20 mt-2" />
              </div>
            </div>
          </div>
          <div className="h-4 w-4 bg-gray-200 rounded flex-shrink-0 ml-3" />
        </div>
      </div>
    </div>
  );
}

export function NotificationSkeletonList({ count = 10 }: NotificationSkeletonListProps) {
  return (
    <div className="bg-white">
      {Array.from({ length: count }, (_, index) => (
        <NotificationSkeleton key={`notification-skeleton-${index}`} />
      ))}
    </div>
  );
}
