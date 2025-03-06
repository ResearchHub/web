import React, { useEffect, useState } from 'react';
import { useComments } from '@/contexts/CommentContext';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';

interface LoadMoreRepliesProps {
  commentId: number;
  remainingCount: number;
  isLoading?: boolean;
  debug?: boolean;
}

const LoadMoreReplies: React.FC<LoadMoreRepliesProps> = ({
  commentId,
  remainingCount,
  isLoading: externalLoading = false,
  debug = false,
}) => {
  const { loadMoreReplies } = useComments();
  const [loading, setLoading] = useState(false);
  const [loadedReplies, setLoadedReplies] = useState(false);

  // Add debug logging when the component mounts or updates
  useEffect(() => {
    if (debug) {
      console.log('[LoadMoreReplies] Component mounted/updated:', {
        commentId,
        remainingCount,
        loading,
        loadedReplies,
      });
    }
  }, [commentId, remainingCount, loading, loadedReplies, debug]);

  // Reset loadedReplies state when commentId changes
  useEffect(() => {
    setLoadedReplies(false);
  }, [commentId]);

  const handleLoadMore = async () => {
    if (debug) {
      console.log(
        '[LoadMoreReplies] Loading more replies for comment',
        commentId,
        'remaining:',
        remainingCount
      );
    }
    setLoading(true);
    try {
      await loadMoreReplies(commentId);
      setLoadedReplies(true);
      if (debug) {
        console.log('[LoadMoreReplies] Successfully loaded more replies for comment', commentId);
      }
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
    <div className="mt-2 mb-3 ml-2">
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
          className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 flex items-center text-sm font-medium border border-blue-200 bg-blue-50"
        >
          {isButtonLoading ? (
            'Loading...'
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {remainingCount} more {remainingCount === 1 ? 'reply' : 'replies'}
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default LoadMoreReplies;
