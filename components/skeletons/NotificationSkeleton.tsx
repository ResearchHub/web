export function NotificationSkeleton() {
  return (
    <div className="p-4 rounded-lg border bg-white animate-pulse">
      <div className="flex justify-between items-start">
        <div className="w-full">
          {/* Header - User name and type */}
          <div className="flex items-center space-x-2 mb-2">
            <div className="h-4 bg-gray-200 rounded w-32"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>

          {/* Body text */}
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>

          {/* Document info */}
          <div className="mt-2">
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>

          {/* Date */}
          <div className="mt-2">
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
