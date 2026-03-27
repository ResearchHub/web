'use client';

import { Skeleton } from '@/components/ui/Skeleton';

const LIST_CARD_BASE_CLASS = 'w-full bg-white border border-gray-200 rounded-lg p-4 shadow-sm';

export interface ListCardSkeletonProps {
  /** Number of card placeholders to render (default 1). Rendered in a space-y-4 list. */
  rowCount?: number;
}

/**
 * Skeleton that matches ListCard layout (e.g. for mobile list views).
 * Use when loading library, templates, outreach, editors card lists.
 */
export function ListCardSkeleton({ rowCount = 1 }: ListCardSkeletonProps) {
  const cards = Array.from({ length: rowCount }).map((_, index) => (
    <div key={index} className={LIST_CARD_BASE_CLASS}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0 space-y-2">
          <Skeleton className="h-4 w-full max-w-[200px]" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-5 rounded flex-shrink-0" />
      </div>
    </div>
  ));

  return rowCount === 1 ? cards[0] : <div className="space-y-4">{cards}</div>;
}
