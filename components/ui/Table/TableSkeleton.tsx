'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { TableHead } from '@/components/ui/Table/TableHead';
import { TableBody } from '@/components/ui/Table/TableBody';
import { TableRow } from '@/components/ui/Table/TableRow';
import { TableCell } from '@/components/ui/Table/TableCell';
import { TableHeader } from '@/components/ui/Table/TableHeader';
import type { SortableColumn } from '@/components/ui/Table/TableContainer';

export interface TableSkeletonProps {
  columns: SortableColumn[];
  rowCount?: number;
}

export function TableSkeleton({ columns, rowCount = 10 }: TableSkeletonProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableHeader key={column.key} sortable={false}>
                {column.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {columns.map((column) => (
                <TableCell key={column.key}>
                  <Skeleton className="h-4 w-full max-w-[120px]" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
