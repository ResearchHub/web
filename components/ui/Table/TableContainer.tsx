import { ReactNode, useState, useCallback } from 'react';
import { cn } from '@/utils/styles';
import { Table } from './Table';
import { TableHead } from './TableHead';
import { TableBody } from './TableBody';
import { TableHeader, SortDirection } from './TableHeader';
import { TableRow } from './TableRow';
import { TableCell } from './TableCell';

export interface SortableColumn {
  key: string;
  label: string;
  sortable?: boolean;
}

export interface TableContainerProps {
  columns: SortableColumn[];
  data: Record<string, any>[];
  onSort?: (field: string, direction: SortDirection) => void;
  className?: string;
  rowKey?: string;
  onRowClick?: (row: Record<string, any>) => void;
}

export function TableContainer({
  columns,
  data,
  onSort,
  className,
  rowKey = 'id',
  onRowClick,
}: TableContainerProps) {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);

  const handleSort = useCallback(
    (field: string) => {
      let newDirection: SortDirection = 'asc';

      if (sortField === field) {
        if (sortDirection === 'asc') {
          newDirection = 'desc';
        } else if (sortDirection === 'desc') {
          newDirection = null;
        }
      }

      setSortField(newDirection ? field : null);
      setSortDirection(newDirection);

      if (onSort) {
        onSort(field, newDirection);
      }
    },
    [sortField, sortDirection, onSort]
  );

  const getSortDirection = (field: string): SortDirection => {
    return sortField === field ? sortDirection : null;
  };

  return (
    <div className={cn('w-full', className)}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableHeader
                key={column.key}
                sortable={column.sortable}
                sortDirection={getSortDirection(column.key)}
                onSort={() => column.sortable && handleSort(column.key)}
              >
                {column.label}
              </TableHeader>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={row[rowKey] || index} onClick={() => onRowClick?.(row)}>
              {columns.map((column) => (
                <TableCell key={column.key}>{row[column.key]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
