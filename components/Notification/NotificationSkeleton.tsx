export function NotificationSkeleton() {
  return (
    <div className="group">
      <div className="relative py-3 px-4 -mx-4">
        <div className="flex gap-3 items-center">
          <div className="flex-shrink-0">
            <div className="w-[38px] h-[38px] bg-gray-200 rounded-full animate-pulse" />
          </div>
          <div className="flex-grow min-w-0 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-24 animate-pulse mt-0.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
