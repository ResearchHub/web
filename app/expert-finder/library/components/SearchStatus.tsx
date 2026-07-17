'use client';

import { cn } from '@/utils/styles';
import { SearchStatus as SearchStatusType } from '@/services/expertFinder.service';

interface SearchStatusProps {
  status: SearchStatusType;
  className?: string;
}

const STATUS_LABELS: Record<SearchStatusType, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_TEXT_CLASSES: Record<SearchStatusType, string> = {
  pending: 'text-gray-600',
  processing: 'text-primary-600',
  completed: 'text-green-700',
  failed: 'text-red-600',
};

export function SearchStatus({ status, className }: SearchStatusProps) {
  return (
    <span className={cn('font-medium', STATUS_TEXT_CLASSES[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}
