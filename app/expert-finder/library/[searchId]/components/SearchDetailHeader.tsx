'use client';

import Link from 'next/link';
import { SearchStatusBadge } from '@/app/expert-finder/library/components/SearchStatusBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Badge } from '@/components/ui/Badge';
import { formatTimestamp } from '@/utils/date';
import type { ExpertSearchResult } from '@/types/expertFinder';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';

interface SearchDetailHeaderProps {
  search: ExpertSearchResult;
}

export function SearchDetailHeader({ search }: SearchDetailHeaderProps) {
  const createdBy = search.createdBy?.author;
  const authorId = createdBy?.id;

  return (
    <>
      <div className="flex flex-wrap items-start justify-start gap-4">
        <Badge variant="default" size="sm">
          Created {formatTimestamp(search.createdAt, false)}
        </Badge>
        <SearchStatusBadge status={search.status} />
        {createdBy && (
          <span className="text-sm text-gray-600">
            Created by:{' '}
            {authorId ? (
              <AuthorTooltip authorId={authorId}>
                <Link
                  href={`/author/${authorId}`}
                  className="font-medium text-primary-600 hover:text-primary-700 hover:underline"
                >
                  {createdBy.fullName}
                </Link>
              </AuthorTooltip>
            ) : (
              <span className="font-medium text-gray-900">{createdBy.fullName}</span>
            )}
          </span>
        )}
      </div>
      {search.work && <RelatedWorkCard work={search.work} size="sm" />}
    </>
  );
}
