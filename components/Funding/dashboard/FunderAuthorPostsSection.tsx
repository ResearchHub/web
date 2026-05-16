'use client';

import { FC } from 'react';
import { AuthorPostsCarousel } from '@/components/Comment/components/AuthorPostsCarousel';
import { useFunderAuthorPosts } from './hooks/useFunderAuthorPosts';

interface FunderAuthorPostsSectionProps {
  funderId: number;
  className?: string;
}

// Mirrors the dashed-border empty state used by the "My funding opportunities"
// section below so both sections feel like one page rhythm.
const EmptyState: FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
    <p className="text-sm text-gray-500">
      No activity yet — author updates and peer reviews from your applicants will show up here.
    </p>
  </div>
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
      headerVariant="page"
      showRelatedWork
      showTypeBadge
      emptyState={<EmptyState />}
      variant="plain"
      className={className}
    />
  );
};
