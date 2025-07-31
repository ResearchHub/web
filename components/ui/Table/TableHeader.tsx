import { ReactNode } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/utils/styles';

export type SortDirection = 'asc' | 'desc' | null;

export interface TableHeaderProps {
  children: ReactNode;
  sortable?: boolean;
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
}

export function TableHeader({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  className,
}: TableHeaderProps) {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const renderSortIcon = () => {
    if (!sortable) return null;

    if (sortDirection === 'asc') {
      return <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
    if (sortDirection === 'desc') {
      return <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />;
    }
    return <ChevronUp className="h-4 w-4 text-gray-300 flex-shrink-0" />;
  };

  return (
    <th
      className={cn(
        'px-3 py-3 text-left text-sm font-medium text-gray-700 bg-gray-50',
        'min-w-0 whitespace-nowrap',
        sortable && 'cursor-pointer hover:bg-gray-100 transition-colors',
        'touch-manipulation', // Better touch handling
        className
      )}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2">
        <span className="truncate">{children}</span>
        {renderSortIcon()}
      </div>
    </th>
  );
}
