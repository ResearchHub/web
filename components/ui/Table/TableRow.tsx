import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface TableRowProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function TableRow({ children, className, onClick }: TableRowProps) {
  return (
    <tr
      className={cn(
        'hover:bg-gray-50 transition-colors',
        onClick && 'cursor-pointer',
        'touch-manipulation', // Better touch handling
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}
