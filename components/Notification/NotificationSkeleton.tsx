export function NotificationSkeleton() {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex gap-4 items-start">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        </div>
        <div className="flex-grow min-w-0 space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse" />
        </div>
      </div>
    </div>
  );
}
