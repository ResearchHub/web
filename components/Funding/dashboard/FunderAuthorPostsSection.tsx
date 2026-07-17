'use client';

import { FC } from 'react';
import { AuthorPostsCarousel } from '@/components/Comment/components/AuthorPostsCarousel';
import { useFunderAuthorPosts } from './hooks/useFunderAuthorPosts';

interface FunderAuthorPostsSectionProps {
  funderId: number;
  className?: string;
}

const EmptyState: FC = () => (
  <div className="rounded-xl border border-dashed border-gray-200 px-6 py-12 text-center">
    <p className="text-sm text-gray-500">
      No activity yet — author updates and peer reviews from your applicants will show up here.
    </p>
  </div>
);

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
      subtitle="Recent updates from authors and peer-reviewers"
      headerVariant="page"
      showRelatedWork
      showTypeBadge
      emptyState={<EmptyState />}
      variant="plain"
      className={className}
    />
  );
};
