import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface TableCellProps {
  children: ReactNode;
  className?: string;
}

export function TableCell({ children, className }: TableCellProps) {
  return (
    <td
      className={cn(
        'px-3 py-3 text-sm text-gray-900',
        'min-w-0', // Allow content to shrink
        className
      )}
    >
      <div className="truncate">{children}</div>
    </td>
  );
}
