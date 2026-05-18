'use client';

import { FC, ReactNode } from 'react';
import { Carousel } from '@/components/ui/Carousel';
import { cn } from '@/utils/styles';
import type { PostCardData } from '../lib/postCard';
import { EmbeddedPostCard } from './EmbeddedPostCard';
import { ReviewPostCard } from './ReviewPostCard';

interface AuthorPostsCarouselProps {
  cards: PostCardData[];
  showRelatedWork?: boolean;
  showTypeBadge?: boolean;
  title?: ReactNode;
  subtitle?: ReactNode;
  headerAction?: ReactNode;
  headerVariant?: 'compact' | 'page';
  isLoading?: boolean;
  hasMore?: boolean;
  loadMore?: () => void;
  emptyState?: ReactNode;
  variant?: 'card' | 'plain';
  arrowOffset?: 'inset' | 'outset';
  className?: string;
}

const CardForVariant: FC<{
  card: PostCardData;
  showRelatedWork?: boolean;
  showTypeBadge?: boolean;
}> = ({ card, showRelatedWork, showTypeBadge }) => {
  switch (card.kind) {
    case 'post':
      return (
        <EmbeddedPostCard
          data={card}
          showRelatedWork={showRelatedWork}
          showTypeBadge={showTypeBadge}
        />
      );
    case 'review':
      return (
        <ReviewPostCard
          data={card}
          showRelatedWork={showRelatedWork}
          showTypeBadge={showTypeBadge}
        />
      );
  }
};

const summarizeCount = (cards: PostCardData[]): string => {
  if (cards.length === 0) return '';
  const kinds = new Set(cards.map((c) => c.kind));
  const singular = kinds.size === 1 && kinds.has('review') ? 'review' : 'update';
  const plural = singular === 'review' ? 'reviews' : 'updates';
  return `${cards.length} ${cards.length === 1 ? singular : plural}`;
};

const INITIAL_SKELETONS = 4;
const PAGE_SKELETONS = 2;

const Skeleton: FC = () => (
  <div className="snap-start shrink-0 w-[88vw] sm:!w-[420px] max-w-[440px] h-[360px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
);

export const AuthorPostsCarousel: FC<AuthorPostsCarouselProps> = ({
  cards,
  showRelatedWork,
  showTypeBadge,
  title,
  subtitle,
  headerAction,
  headerVariant = 'compact',
  isLoading,
  hasMore,
  loadMore,
  emptyState,
  variant = 'plain',
  arrowOffset,
  className,
}) => {
  const resolvedArrowOffset = arrowOffset ?? (variant === 'plain' ? 'outset' : 'inset');
  const hasCards = cards.length > 0;
  const showInitialSkeletons = !!isLoading && !hasCards;
  const showPageSkeletons = !!isLoading && hasCards;
  const handleReachEnd = hasMore && !isLoading ? loadMore : undefined;

  const isPageHeader = headerVariant === 'page';

  const header = (title || subtitle || headerAction) && (
    <div className="mb-4">
      <div
        className={cn(
          'flex justify-between gap-3',
          isPageHeader ? 'items-baseline' : 'items-center'
        )}
      >
        <div className={cn('flex items-baseline', isPageHeader ? 'gap-2.5' : 'gap-2')}>
          {typeof title === 'string' ? (
            isPageHeader ? (
              <h2 className="text-lg font-semibold tracking-tight text-gray-900">{title}</h2>
            ) : (
              <h3 className="text-base font-bold text-gray-900">{title}</h3>
            )
          ) : (
            title
          )}
          {hasCards && (
            <span className={cn('text-xs text-gray-500', !isPageHeader && 'font-medium')}>
              {summarizeCount(cards)}
            </span>
          )}
        </div>
        {headerAction}
      </div>
      {subtitle &&
        (typeof subtitle === 'string' ? (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        ) : (
          <div className="mt-1">{subtitle}</div>
        ))}
    </div>
  );

  const carouselWrapperClass = 'mx-3';
  let body: ReactNode;
  if (hasCards) {
    body = (
      <div className={carouselWrapperClass}>
        <Carousel onReachEnd={handleReachEnd} arrowOffset={resolvedArrowOffset}>
          {cards.map((card) => (
            <div
              key={card.key}
              className="flex-shrink-0 snap-start w-[88vw] sm:!w-[420px] max-w-[440px]"
            >
              <CardForVariant
                card={card}
                showRelatedWork={showRelatedWork}
                showTypeBadge={showTypeBadge}
              />
            </div>
          ))}
          {showPageSkeletons &&
            Array.from({ length: PAGE_SKELETONS }).map((_, i) => <Skeleton key={`page-${i}`} />)}
        </Carousel>
      </div>
    );
  } else if (showInitialSkeletons) {
    body = (
      <div className={carouselWrapperClass}>
        <Carousel arrowOffset={resolvedArrowOffset}>
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
