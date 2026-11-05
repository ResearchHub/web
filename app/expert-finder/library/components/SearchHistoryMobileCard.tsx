'use client';

import { SearchStatus } from './SearchStatus';
import { formatTimestamp } from '@/utils/date';
import { getSearchTableDisplayText } from '@/app/expert-finder/lib/utils';
import type { ExpertSearchListItem } from '@/types/expertFinder';
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
  const displayName = getSearchTableDisplayText(search);
  const expertCount = search.status === 'completed' ? search.expertCount : null;
  const createdByName = search.createdBy?.author?.fullName;

  return (
    <ListCard onClick={onClick} className={className}>
      <h3 className="text-sm font-medium text-gray-900 truncate">{displayName}</h3>
      {createdByName && <p className="text-xs text-gray-500 mt-0.5">by {createdByName}</p>}
      <div className="flex flex-wrap items-center gap-x-2 mt-2 text-xs text-gray-500">
        {expertCount !== null && (
          <span>
            {expertCount} expert{expertCount !== 1 ? 's' : ''}
          </span>
        )}
        {expertCount !== null && <span className="text-gray-400">•</span>}
        <span>{formatTimestamp(search.createdAt, false)}</span>
        <span className="text-gray-400">•</span>
        <SearchStatus status={search.status} className="text-xs" />
      </div>
    </ListCard>
  );
}
