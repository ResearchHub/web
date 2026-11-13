import React, { useState } from 'react';
import { useComments } from '@/contexts/CommentContext';
import { ChevronDown } from 'lucide-react';

interface LoadMoreRepliesProps {
  commentId: number;
  remainingCount: number;
  isLoading?: boolean;
}

/**
 * A quiet text button in a thread's reply column, for replies not loaded yet. Gone
 * once they are in, since nothing is left to load.
 */
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

  // If there are no remaining replies, don't render the button
  if (remainingCount <= 0) {
    return null;
  }

  const isButtonLoading = loading || externalLoading;

  return (
    <button
      type="button"
      onClick={handleLoadMore}
      disabled={isButtonLoading}
      className="mt-3 inline-flex min-h-8 items-center gap-1 text-sm font-semibold text-gray-600 transition-colors hover:text-gray-900 disabled:cursor-default disabled:opacity-60"
    >
      <ChevronDown className="h-4 w-4" aria-hidden />
      {isButtonLoading
        ? 'Loading…'
        : `Show ${remainingCount} more ${remainingCount === 1 ? 'reply' : 'replies'}`}
    </button>
  );
};

export default LoadMoreReplies;
