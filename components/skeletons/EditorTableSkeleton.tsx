import { Skeleton } from '@/components/ui/Skeleton';
import { TableContainer, SortableColumn } from '@/components/ui/Table/TableContainer';

interface EditorTableSkeletonProps {
  columns: SortableColumn[];
  rowCount: number;
}

export function EditorTableSkeleton({ columns, rowCount }: EditorTableSkeletonProps) {
  // Create skeleton data that matches the structure of the actual table
  const skeletonData = Array.from({ length: rowCount }).map((_, index) => ({
    id: `skeleton-${index}`,
    user: (
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    ),
    lastSubmission: <Skeleton className="h-4 w-20" />,
    lastComment: <Skeleton className="h-4 w-20" />,
    submissions: <Skeleton className="h-4 w-8" />,
    tips: <Skeleton className="h-4 w-8" />,
    comments: <Skeleton className="h-4 w-8" />,
    actions: <Skeleton className="h-8 w-8 rounded" />,
  }));

  return <TableContainer columns={columns} data={skeletonData} className="w-full" />;
}
