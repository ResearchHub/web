'use client';

import { Badge } from '@/components/ui/Badge';
import type { SearchStatus } from '@/types/expertFinder';

interface SearchStatusBadgeProps {
  status: SearchStatus;
  className?: string;
}

const STATUS_VARIANTS: Record<
  SearchStatus,
  'default' | 'primary' | 'success' | 'warning' | 'error'
> = {
  pending: 'default',
  processing: 'primary',
  completed: 'success',
  failed: 'error',
};

const STATUS_LABELS: Record<SearchStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function SearchStatusBadge({ status, className }: SearchStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} size="sm" className={className}>
      {STATUS_LABELS[status]}
    </Badge>
  );
}
