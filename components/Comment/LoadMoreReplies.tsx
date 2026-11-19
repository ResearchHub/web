import React, { useEffect, useState } from 'react';
import { useComments } from '@/contexts/CommentContext';
import { Button } from '@/components/ui/Button';

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
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLoadMore}
          disabled={isButtonLoading}
          className="-mx-1 h-auto px-1 py-0.5 text-xs font-semibold text-gray-600 hover:text-gray-900"
        >
          {isButtonLoading ? (
            'Loading...'
          ) : (
            <>
              Show {remainingCount} more {remainingCount === 1 ? 'reply' : 'replies'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default LoadMoreReplies;
