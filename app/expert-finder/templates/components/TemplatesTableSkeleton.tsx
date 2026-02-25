'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { Table } from '@/components/ui/Table';
import { TableHead } from '@/components/ui/Table/TableHead';
import { TableBody } from '@/components/ui/Table/TableBody';
import { TableRow } from '@/components/ui/Table/TableRow';
import { TableCell } from '@/components/ui/Table/TableCell';
import { TableHeader } from '@/components/ui/Table/TableHeader';
import { TEMPLATES_TABLE_COLUMNS } from './TemplatesTable';

interface TemplatesTableSkeletonProps {
  rowCount?: number;
}

export function TemplatesTableSkeleton({ rowCount = 10 }: TemplatesTableSkeletonProps) {
  return (
    <div className="w-full">
      <Table>
        <TableHead>
          <TableRow>
            {TEMPLATES_TABLE_COLUMNS.map((column) => (
              <TableHeader key={column.key} sortable={false}>
                {column.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rowCount }).map((_, index) => (
            <TableRow key={`skeleton-${index}`}>
              {TEMPLATES_TABLE_COLUMNS.map((column) => (
                <TableCell key={column.key}>
                  {column.key === 'contact' ? (
                    <div className="flex flex-col gap-0.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-40" />
                      <Skeleton className="h-4 w-36" />
                    </div>
                  ) : (
                    <Skeleton className="h-4 w-full max-w-[120px]" />
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
