interface NotificationSkeletonProps {
  showBadge?: boolean;
  showTitle?: boolean;
}

export function NotificationSkeleton({
  showBadge = false,
  showTitle = false,
}: NotificationSkeletonProps) {
  return (
    <div className="group">
      <div className="relative py-3 px-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center min-w-0 flex-1">
            <div className="w-2 flex-shrink-0 flex items-center justify-center self-center">
              <div className="w-2 h-2 rounded-full bg-gray-200" />
            </div>
            <div className="ml-2 flex gap-3 items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <div className="w-[40px] h-[40px] bg-gray-200 rounded-full animate-pulse" />
              </div>
              <div className="flex-grow min-w-0 space-y-2">
                {showBadge && (
                  <div className="h-5 bg-gray-200 rounded-full w-20 animate-pulse" />
                )}
                <div className="h-4 bg-gray-200 rounded w-full max-w-md animate-pulse" />
                {showTitle && (
                  <div className="h-4 bg-gray-200 rounded w-2/3 max-w-sm animate-pulse" />
                )}
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
          <div className="flex-shrink-0 pl-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
