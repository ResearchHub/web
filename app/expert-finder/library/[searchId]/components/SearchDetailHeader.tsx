'use client';

import Link from 'next/link';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { SearchStatus } from '@/services/expertFinder.service';
import type { ExpertSearchResult } from '@/types/expertFinder';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';

interface SearchDetailHeaderProps {
  search: ExpertSearchResult;
}

const STATUS_LABELS: Record<SearchStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

const STATUS_COLORS: Record<SearchStatus, string> = {
  pending: 'text-gray-500',
  processing: 'text-primary-600',
  completed: 'text-green-600',
  failed: 'text-red-600',
};

/**
 * Search metadata: created date, status, creator — plain text, dot-separated.
 * Rendered by the page directly below the breadcrumb title (not the doc card).
 */
export function SearchDetailMeta({ search }: SearchDetailHeaderProps) {
  const createdBy = search.createdBy?.author;
  const authorId = createdBy?.id;

  return (
    <div className="flex flex-wrap items-center gap-x-1.5 text-sm text-gray-500">
      <span>{formatTimestamp(search.createdAt, false)}</span>
      <span aria-hidden>·</span>
      <span className={cn('font-medium', STATUS_COLORS[search.status])}>
        {STATUS_LABELS[search.status]}
      </span>
      {createdBy && (
        <>
          <span aria-hidden>·</span>
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
              <span className="font-medium text-gray-700">{createdBy.fullName}</span>
            )}
          </span>
        </>
      )}
    </div>
  );
}

export function SearchDetailHeader({ search }: SearchDetailHeaderProps) {
  return (
    <>
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
