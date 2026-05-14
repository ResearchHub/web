'use client';

import { FC } from 'react';
import { AuthorPostsCarousel } from '@/components/Comment/components/AuthorPostsCarousel';
import { useFunderAuthorPosts } from './hooks/useFunderAuthorPosts';

interface FunderAuthorPostsSectionProps {
  funderId: number;
  className?: string;
}

const EmptyState: FC = () => (
  <p className="m-0 text-sm text-gray-500">
    No updates from your applicants yet — they&apos;ll show up here as posts roll in.
  </p>
);

/**
 * Funder dashboard surface that aggregates `AUTHOR_UPDATE` posts across all
 * of the funder's RFPs. Uses the same carousel + card primitives as the
 * proposal page, with `showRelatedWork` turned on so each card links back
 * to the proposal it belongs to (the bit of context that's redundant on the
 * proposal page itself).
 */
export const FunderAuthorPostsSection: FC<FunderAuthorPostsSectionProps> = ({
  funderId,
  className,
}) => {
  const { cards, isLoading, hasMore, loadMore } = useFunderAuthorPosts(funderId);

  return (
    <AuthorPostsCarousel
      cards={cards}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      title="Recent activity"
      showRelatedWork
      emptyState={<EmptyState />}
      variant="card"
      className={className}
    />
  );
};
