'use client';

import { SearchStatusBadge } from '@/app/expert-finder/library/components/SearchStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import type { ExpertSearchResult } from '@/types/expertFinder';

interface SearchDetailHeaderProps {
  search: ExpertSearchResult;
}

export function SearchDetailHeader({ search }: SearchDetailHeaderProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Expert Search</h2>
          <p className="text-sm text-gray-600 break-words">
            {search.query
              ? search.query.length > 200
                ? `${search.query.slice(0, 200)}…`
                : search.query
              : 'No query'}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="default" size="sm">
              Created {formatTimestamp(search.createdAt, false)}
            </Badge>
            {search.processingTime != null && search.processingTime > 0 && (
              <Badge variant="default" size="sm">
                Processing time: {Number(search.processingTime).toFixed(2)}s
              </Badge>
            )}
          </div>
        </div>
        <SearchStatusBadge status={search.status} />
      </div>
    </div>
  );
}
