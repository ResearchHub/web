'use client';

import { FC, ReactNode, useMemo } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { ActivityStoryCard } from './ActivityStoryCard';
import type { FeedEntry, FeedCommentContent } from '@/types/feed';

interface ActivityStoryCarouselProps {
  entries: FeedEntry[];
  isLoading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  className?: string;
  /** Optional section title rendered above the carousel. Auto-hidden when no entries. */
  title?: ReactNode;
}

const INITIAL_SKELETONS = 4;
const PAGE_SKELETONS = 2;

export const ActivityStoryCarousel: FC<ActivityStoryCarouselProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  className,
  title,
}) => {
  const visible = useMemo(
    () =>
      entries.filter((e) => {
        if (e.contentType !== 'COMMENT') return false;
        const ct = (e.content as FeedCommentContent).comment?.commentType;
        return ct === 'REVIEW' || ct === 'AUTHOR_UPDATE';
      }),
    [entries]
  );

  const showInitialSkeletons = !!isLoading && visible.length === 0;
  const showPageSkeletons = !!isLoading && visible.length > 0;
  // Only call loadMore when we actually have more pages and aren't already loading.
  const handleReachEnd = hasMore && !isLoading ? loadMore : undefined;

  if (!isLoading && visible.length === 0) return null;

  return (
    <section className={className}>
      {title && (
        <div className="flex items-baseline gap-2.5 mb-3">
          {typeof title === 'string' ? (
            <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
          ) : (
            title
          )}
          {!isLoading && <span className="text-xs text-gray-500">{visible.length} updates</span>}
        </div>
      )}

      <Carousel onReachEnd={handleReachEnd}>
        {showInitialSkeletons
          ? Array.from({ length: INITIAL_SKELETONS }).map((_, i) => <Skeleton key={`init-${i}`} />)
          : visible.map((entry) => <ActivityStoryCard key={entry.id} entry={entry} />)}
        {showPageSkeletons &&
          Array.from({ length: PAGE_SKELETONS }).map((_, i) => <Skeleton key={`page-${i}`} />)}
      </Carousel>
    </section>
  );
};

const Skeleton: FC = () => (
  <div className="snap-start shrink-0 w-[280px] h-[360px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
);
