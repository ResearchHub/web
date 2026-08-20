'use client';

import { FC } from 'react';
import { Activity } from 'lucide-react';
import { AuthorPostsCarousel } from '@/components/Comment/components/AuthorPostsCarousel';
import { useFunderAuthorPosts } from './hooks/useFunderAuthorPosts';

interface FunderAuthorPostsSectionProps {
  funderId: number;
  className?: string;
}

const EmptyState: FC = () => (
  <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-200 px-6 py-10 text-center">
    <div className="mb-3 rounded-full bg-gray-100 p-3">
      <Activity className="h-5 w-5 text-gray-400" />
    </div>
    <p className="text-sm text-gray-500">No activity from your applicants yet</p>
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
      headerVariant="page"
      showRelatedWork
      showTypeBadge
      emptyState={<EmptyState />}
      variant="plain"
      className={className}
    />
  );
};
