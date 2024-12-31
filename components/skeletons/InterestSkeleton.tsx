export function InterestSkeleton() {
  return (
    <div className="p-4 rounded-md border bg-white animate-pulse">
      <div className="flex items-center gap-3">
        {/* Avatar/Icon placeholder */}
        <div className="w-12 h-12 bg-gray-200 rounded-full flex-shrink-0" />
        
        <div className="flex-1">
          {/* Title */}
          <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
          
          {/* Description */}
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full" />
            <div className="h-3 bg-gray-200 rounded w-2/3" />
          </div>
          
          {/* Followers count */}
          <div className="mt-2">
            <div className="h-3 bg-gray-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
} 