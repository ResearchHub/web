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
            <div className="grid grid-cols-6 gap-4 items-center">
              {/* User column */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
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
