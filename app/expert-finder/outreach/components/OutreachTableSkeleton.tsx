'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { TableHead } from '@/components/ui/Table/TableHead';
import { TableBody } from '@/components/ui/Table/TableBody';
import { TableRow } from '@/components/ui/Table/TableRow';
import { TableCell } from '@/components/ui/Table/TableCell';
import { TableHeader } from '@/components/ui/Table/TableHeader';
import { OUTREACH_TABLE_COLUMNS } from './OutreachTable';

interface OutreachTableSkeletonProps {
  rowCount?: number;
}

export function OutreachTableSkeleton({ rowCount = 10 }: OutreachTableSkeletonProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHead>
          <TableRow>
            {OUTREACH_TABLE_COLUMNS.map((column) => (
              <TableHeader key={column.key} sortable={false}>
                {column.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {OUTREACH_TABLE_COLUMNS.map((column) => (
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
