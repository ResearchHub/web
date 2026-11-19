import React, { useState } from 'react';
import { useComments } from '@/contexts/CommentContext';

interface LoadMoreRepliesProps {
  commentId: number;
  remainingCount: number;
  isLoading?: boolean;
}

/** "See N more replies", sitting in the thread where the unloaded replies belong. */
const LoadMoreReplies: React.FC<LoadMoreRepliesProps> = ({
  commentId,
  remainingCount,
  isLoading: externalLoading = false,
}) => {
  const { loadMoreReplies } = useComments();
  const [loading, setLoading] = useState(false);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      await loadMoreReplies(commentId);
    } catch (error) {
      console.error('[LoadMoreReplies] Error loading more replies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (remainingCount <= 0) {
    return null;
  }

  const isButtonLoading = loading || externalLoading;
  const noun = remainingCount === 1 ? 'reply' : 'replies';
  const label = isButtonLoading ? 'Loading replies…' : `See ${remainingCount} more ${noun}`;

  return (
    <button
      type="button"
      onClick={handleLoadMore}
      disabled={isButtonLoading}
      className="-mx-1 rounded px-1 py-0.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:cursor-default disabled:hover:bg-transparent"
    >
      {label}
    </button>
  );
};

export default LoadMoreReplies;
