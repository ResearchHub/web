'use client';

import { Table } from '@/components/ui/Table';
import { TableHead } from '@/components/ui/Table/TableHead';
import { TableBody } from '@/components/ui/Table/TableBody';
import { TableRow } from '@/components/ui/Table/TableRow';
import { TableCell } from '@/components/ui/Table/TableCell';
import { TableHeader } from '@/components/ui/Table/TableHeader';
import { SortableColumn } from '@/components/ui/Table/TableContainer';

interface ReferralTableSkeletonProps {
  columns: SortableColumn[];
  rowCount?: number;
}

export function ReferralTableSkeleton({ columns, rowCount = 10 }: ReferralTableSkeletonProps) {
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
                  <div className="animate-pulse">
                    {column.key === 'referrerUser' || column.key === 'fullName' ? (
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex-shrink-0" />
                        <div className="h-4 bg-gray-200 rounded w-32" />
                      </div>
                    ) : column.key === 'isReferralBonusExpired' ? (
                      <div className="h-6 bg-gray-200 rounded-full w-16" />
                    ) : column.key === 'totalFunded' || column.key === 'referralBonusEarned' ? (
                      <div className="h-4 bg-gray-200 rounded w-20" />
                    ) : (
                      <div className="h-4 bg-gray-200 rounded w-24" />
                    )}
                  </div>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
