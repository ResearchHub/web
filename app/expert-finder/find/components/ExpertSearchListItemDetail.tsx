'use client';

import { formatTimeAgo } from '@/utils/date';
import type { ExpertSearchListItem } from '@/types/expertFinder';

const QUERY_TRUNCATE_LEN = 80;

export function getSearchDisplayText(search: ExpertSearchListItem): string {
  const text = (search.name || search.query || '').trim();
  if (!text) return 'Untitled search';
  return text.length <= QUERY_TRUNCATE_LEN ? text : text.slice(0, QUERY_TRUNCATE_LEN) + '...';
}

export interface ExpertSearchListItemDetailProps {
  search: ExpertSearchListItem;
}

/**
 * Compact display of an expert search list item: query text, expert count, date.
 */
export function ExpertSearchListItemDetail({ search }: ExpertSearchListItemDetailProps) {
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
      </div>
    </>
  );
}
