import { ReactNode } from 'react';
import { cn } from '@/utils/styles';

export interface MobileTableCardProps {
  data: Record<string, any>;
  columns: { key: string; label: string }[];
  onClick?: () => void;
  className?: string;
}

export function MobileTableCard({ data, columns, onClick, className }: MobileTableCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 space-y-2',
        onClick && 'cursor-pointer hover:bg-gray-50 transition-colors',
        className
      )}
      onClick={onClick}
    >
      {columns.map((column) => (
        <div key={column.key} className="flex justify-between items-start">
          <span className="text-sm font-medium text-gray-500 min-w-0 flex-shrink-0">
            {column.label}
          </span>
          <span className="text-sm text-gray-900 text-right min-w-0 flex-1 ml-4 truncate">
            {data[column.key]}
          </span>
        </div>
      ))}
    </div>
  );
}
