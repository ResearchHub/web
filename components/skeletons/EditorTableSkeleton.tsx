import { Skeleton } from '@/components/ui/Skeleton';
import { SortableColumn } from '@/components/ui/Table';

interface EditorTableSkeletonProps {
  columns: SortableColumn[];
  rowCount: number;
}

export function EditorTableSkeleton({ columns, rowCount }: EditorTableSkeletonProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-6 gap-4">
          {columns.map((column) => (
            <div key={column.key} className="text-sm font-medium text-gray-500">
              {column.label}
            </div>
          ))}
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-gray-200">
        {Array.from({ length: rowCount }).map((_, index) => (
          <div key={index} className="px-6 py-4">
            <div className="grid grid-cols-6 gap-4 items-start">
              {/* User column - now taller to accommodate extra content */}
              <div className="flex items-start gap-3">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-28" />
                  {/* Hub tags skeleton */}
                  <div className="flex gap-1">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  {/* Active contributors skeleton */}
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>

              {/* Other columns */}
              {Array.from({ length: 5 }).map((_, colIndex) => (
                <Skeleton key={colIndex} className="h-4 w-20" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
