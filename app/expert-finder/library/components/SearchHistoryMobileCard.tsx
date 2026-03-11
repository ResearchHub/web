'use client';

import { SearchStatusBadge } from './SearchStatusBadge';
import { formatTimestamp } from '@/utils/date';
import { getDisplayText } from './SearchHistoryTable';
import type { ExpertSearchListItem } from '@/types/expertFinder';
import { Badge } from '@/components/ui/Badge';
import { ListCard } from '@/components/ui/ListCard';

export interface SearchHistoryMobileCardProps {
  search: ExpertSearchListItem;
  onClick: () => void;
  className?: string;
}

export function SearchHistoryMobileCard({
  search,
  onClick,
  className,
}: SearchHistoryMobileCardProps) {
  const displayName = getDisplayText(search);
  const expertCount = search.status === 'completed' ? search.expertCount : null;

  return (
    <ListCard onClick={onClick} className={className}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
      <div className="flex flex-wrap items-center gap-2 mt-2">
        {expertCount !== null && (
          <span className="text-xs text-gray-500">
            {expertCount} expert{expertCount !== 1 ? 's' : ''}
          </span>
        )}
        <Badge variant="default" size="sm">
          {formatTimestamp(search.createdAt, false)}
        </Badge>
        <SearchStatusBadge status={search.status} />
      </div>
    </ListCard>
  );
}
