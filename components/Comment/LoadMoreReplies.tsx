import React, { useEffect, useState } from 'react';
import { useComments } from '@/contexts/CommentContext';

interface LoadMoreRepliesProps {
  commentId: number;
  remainingCount: number;
  isLoading?: boolean;
}

const LoadMoreReplies: React.FC<LoadMoreRepliesProps> = ({
  commentId,
  remainingCount,
  isLoading: externalLoading = false,
}) => {
  const { loadMoreReplies } = useComments();
  const [loading, setLoading] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState(false);

  // Reset loadedReplies state when commentId changes
  useEffect(() => {
    setLoadedReplies(false);
  }, [commentId]);

  const handleLoadMore = async () => {
    setLoading(true);
    try {
      await loadMoreReplies(commentId);
      setLoadedReplies(true);
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
    <div>
      {loadedReplies ? (
        <div className="text-sm text-green-600 mb-2 flex items-center">
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Replies loaded
        </div>
      ) : (
        <button
          type="button"
          onClick={handleLoadMore}
          disabled={isButtonLoading}
          className="rounded text-xs font-semibold text-gray-600 hover:text-gray-900 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          {isButtonLoading ? (
            'Loading...'
          ) : (
            <>
              Show {remainingCount} more {remainingCount === 1 ? 'reply' : 'replies'}
            </>
          )}
        </button>
      )}
    </div>
  );
};

export default LoadMoreReplies;
