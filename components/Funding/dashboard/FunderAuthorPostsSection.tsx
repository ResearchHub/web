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
    No activity yet — author updates and peer reviews from your applicants will show up here.
  </p>
);

/**
 * Funder dashboard surface that aggregates author updates and peer reviews
 * across all of the funder's RFPs. Uses the same carousel + card primitives
 * as the proposal page, with `showRelatedWork` turned on so each card links
 * back to the proposal it belongs to (the bit of context that's redundant
 * on the proposal page itself).
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
      showTypeBadge
      emptyState={<EmptyState />}
      variant="card"
      className={className}
    />
  );
};
