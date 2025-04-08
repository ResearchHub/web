export function NotificationSkeleton() {
  return (
    <div className="group">
      <div className="relative py-3 px-4 -mx-4">
        <div className="flex items-center">
          <div className="pl-1 flex-shrink-0 flex items-center justify-center self-center">
            <div className="w-2 h-2 rounded-full bg-gray-200"></div>
          </div>
          <div className="ml-3 flex gap-3 items-center">
            <div className="flex-shrink-0">
              <div className="w-[40px] h-[40px] bg-gray-200 rounded-full animate-pulse" />
            </div>
            <div className="flex-grow min-w-0 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-48 animate-pulse" />
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded-full w-16 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
