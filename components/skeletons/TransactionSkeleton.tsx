export function TransactionSkeleton() {
  return (
    <div className="group">
      <div className="relative py-3 transition-all duration-200 rounded-lg px-4 -mx-4">
        <div className="flex items-center justify-between">
          <div className="flex gap-3 w-full">
            {/* Icon placeholder */}
            <div className="w-[38px] h-[38px] flex items-center justify-center rounded-full bg-gray-50">
              <div className="h-4 w-4 bg-gray-200 rounded" />
            </div>

            <div className="flex-1">
              {/* Title */}
              <div className="flex items-center gap-2">
                <p className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              {/* Date */}
              <div className="text-xs mt-0.5">
                <div className="h-3 w-32 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Amount section */}
            <div className="flex flex-col items-end min-w-[140px]">
              <div className="flex items-center justify-end w-full">
                <div className="flex flex-col items-end">
                  {/* RSC Amount */}
                  <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                  {/* USD Value */}
                  <div className="h-3 w-16 bg-gray-200 rounded animate-pulse mt-1" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 