'use client';

import { formatTimeAgo } from '@/utils/date';
import { getSearchDisplayText, getShortAuthorName } from '@/app/expert-finder/lib/utils';
import type { ExpertSearchListItem } from '@/types/expertFinder';

export interface ExpertSearchListItemDetailProps {
  search: ExpertSearchListItem;
}

/**
 * Compact display of an expert search list item: query text, expert count, date, created by.
 */
export function ExpertSearchListItemDetail({ search }: ExpertSearchListItemDetailProps) {
  const createdByShort = getShortAuthorName(search.createdBy?.author ?? undefined);

  return (
    <>
      <span className="text-sm font-medium text-gray-900 line-clamp-2 break-words">
        {getSearchDisplayText(search)}
      </span>
      <div className="flex items-center gap-2 flex-wrap mt-0.5">
        <span className="text-xs text-gray-500">
          {search.expertCount} expert
          {search.expertCount !== 1 ? 's' : ''}
        </span>
        <span className="text-xs text-gray-400">•</span>
        <span className="text-xs text-gray-500">{formatTimeAgo(search.createdAt)}</span>
        {createdByShort && (
          <>
            <span className="text-xs text-gray-400">•</span>
            <span className="text-xs text-gray-500" title={search.createdBy?.author?.fullName}>
              by {createdByShort}
            </span>
          </>
        )}
      </div>
    </>
  );
}
