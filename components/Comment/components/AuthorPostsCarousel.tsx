'use client';

import { FC, ReactNode } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { cn } from '@/utils/styles';
import type { PostCardData } from '../lib/postCard';
import { EmbeddedPostCard } from './EmbeddedPostCard';

interface AuthorPostsCarouselProps {
  cards: PostCardData[];
  /** Forwarded to every rendered card. See `EmbeddedPostCard`. */
  showRelatedWork?: boolean;

  /** Section title. Omit to render the carousel without a header. */
  title?: ReactNode;
  /** Right-aligned slot in the header, e.g. a "New post" button. */
  headerAction?: ReactNode;

  isLoading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;

  /** Rendered in place of the carousel when there are no cards (and not loading). */
  emptyState?: ReactNode;

  /**
   * Visual treatment of the section.
   * - `card`: wrapped in a rounded white card with border + shadow.
   * - `plain`: no chrome, integrates with surrounding page background.
   */
  variant?: 'card' | 'plain';
  className?: string;
}

const INITIAL_SKELETONS = 4;
const PAGE_SKELETONS = 2;

const Skeleton: FC = () => (
  <div className="snap-start shrink-0 w-[88vw] sm:!w-[420px] max-w-[440px] h-[360px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
);

/**
 * Document-agnostic carousel of embedded post cards. Owns the carousel
 * shell, header, pagination triggers, and skeleton/empty states; defers the
 * card content + the meaning of "edit" to its consumer via `PostCardData`.
 */
export const AuthorPostsCarousel: FC<AuthorPostsCarouselProps> = ({
  cards,
  showRelatedWork,
  title,
  headerAction,
  isLoading,
  hasMore,
  loadMore,
  emptyState,
  variant = 'plain',
  className,
}) => {
  const hasCards = cards.length > 0;
  const showInitialSkeletons = !!isLoading && !hasCards;
  const showPageSkeletons = !!isLoading && hasCards;
  // Only fire loadMore when we actually have more pages and aren't already loading.
  const handleReachEnd = hasMore && !isLoading ? loadMore : undefined;

  // Hide the section entirely when there's nothing to show and the consumer
  // didn't provide an empty state — mirrors ActivityStoryCarousel's behavior.
  if (!isLoading && !hasCards && !emptyState) return null;

  const header = (title || headerAction) && (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-baseline gap-2">
        {typeof title === 'string' ? (
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
        ) : (
          title
        )}
        {hasCards && (
          <span className="text-xs font-medium text-gray-500">
            {cards.length} {cards.length === 1 ? 'post' : 'posts'}
          </span>
        )}
      </div>
      {headerAction}
    </div>
  );

  let body: ReactNode;
  if (hasCards) {
    body = (
      <div className="overflow-hidden">
        <Carousel onReachEnd={handleReachEnd}>
          {cards.map((card) => (
            <div
              key={card.key}
              className="flex-shrink-0 snap-start w-[88vw] sm:!w-[420px] max-w-[440px]"
            >
              <EmbeddedPostCard data={card} showRelatedWork={showRelatedWork} />
            </div>
          ))}
          {showPageSkeletons &&
            Array.from({ length: PAGE_SKELETONS }).map((_, i) => <Skeleton key={`page-${i}`} />)}
        </Carousel>
      </div>
    );
  } else if (showInitialSkeletons) {
    body = (
      <div className="overflow-hidden">
        <Carousel>
          {Array.from({ length: INITIAL_SKELETONS }).map((_, i) => (
            <Skeleton key={`init-${i}`} />
          ))}
        </Carousel>
      </div>
    );
  } else {
    body = emptyState;
  }

  return (
    <section
      className={cn(
        variant === 'card' && 'mb-6 rounded-lg border bg-white p-4 shadow-sm sm:!p-6',
        className
      )}
    >
      {header}
      {body}
    </section>
  );
};
