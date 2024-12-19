export function TransactionSkeleton() {
  return (
    <div className="py-3 px-6 -mx-4">
      <div className="animate-pulse">
        <div className="flex items-center justify-between">
          <div className="flex gap-3">
            <div>
              {/* Title row with icon */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-4 py-1">
                  {/* Icon placeholder */}
                  <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                  {/* Title placeholder */}
                  <div className="h-5 w-32 bg-gray-200 rounded"></div>
                </div>
                {/* Status badge placeholder */}
                <div className="h-5 w-10 bg-gray-200 rounded-full"></div>
              </div>

              {/* Metadata line */}
              <div className="flex items-center gap-2 mt-0.5 -ml-7 pl-7">
                {/* Date placeholder */}
                <div className="h-3 w-32 bg-gray-200 rounded"></div>
                <span className="text-gray-200">•</span>
                {/* Link placeholder */}
                <div className="h-3 w-40 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>

          {/* Amount section */}
          <div className="flex flex-col items-end min-w-[140px]">
            <div className="h-5 w-24 bg-gray-200 rounded"></div>
            <div className="h-3 w-16 bg-gray-200 rounded mt-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
} 