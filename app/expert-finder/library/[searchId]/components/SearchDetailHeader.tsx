'use client';

import { SearchStatusBadge } from '@/app/expert-finder/library/components/SearchStatusBadge';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import type { ExpertSearchResult } from '@/types/expertFinder';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';

interface SearchDetailHeaderProps {
  search: ExpertSearchResult;
}

export function SearchDetailHeader({ search }: SearchDetailHeaderProps) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-start gap-4">
        <Badge variant="default" size="sm">
          Created {formatTimestamp(search.createdAt, false)}
        </Badge>
        <SearchStatusBadge status={search.status} />
      </div>
      {search.work && <RelatedWorkCard work={search.work} size="sm" />}
    </>
  );
}
