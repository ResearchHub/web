'use client';

import Link from 'next/link';
import { SearchStatus } from '@/app/expert-finder/library/components/SearchStatus';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
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
      <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-600">
        <span>Created {formatTimestamp(search.createdAt, false)}</span>
        <span className="text-gray-400">•</span>
        <SearchStatus status={search.status} />
        {createdBy && (
          <>
            <span className="text-gray-400">•</span>
            <span>
              Created by{' '}
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
          </>
        )}
      </div>
      {search.work && <RelatedWorkCard work={search.work} size="sm" />}
      {search.additionalContext.trim() !== '' && (
        <section
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm mt-4"
          aria-label="Additional guidance for this search"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-2">Additional guidance</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{search.additionalContext}</p>
        </section>
      )}
    </>
  );
}
