import { Skeleton } from '@/components/ui/Skeleton';

interface EditorMobileSkeletonProps {
  rowCount: number;
}

export function EditorMobileSkeleton({ rowCount }: EditorMobileSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rowCount }).map((_, index) => (
        <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
          <div className="space-y-3">
            {/* User Section */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0">
                    <Skeleton className="h-10 w-10 rounded-full" />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
              </div>

              {/* Actions Dropdown Skeleton */}
              <div className="flex-shrink-0">
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            {/* Hub Tags Skeleton */}
            <div className="flex flex-wrap gap-1">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-18 rounded-full" />
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-100">
              <div className="text-center space-y-1">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </div>
              <div className="text-center space-y-1">
                <Skeleton className="h-5 w-8 mx-auto" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </div>
            </div>

            {/* Activity Dates Skeleton */}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              <div className="flex justify-between text-xs">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex justify-between text-xs">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>

            {/* Active Hub Contributors Skeleton */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
