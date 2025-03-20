import React, { useState, useEffect } from 'react';
import { useComments } from '@/contexts/CommentContext';
import CommentList from './CommentList';
import { Button } from '@/components/ui/Button';
import { Comment } from '@/types/comment';

const CommentTestContent = () => {
  const { comments, loading, error, loadMoreReplies, refresh } = useComments();
  const [debug, setDebug] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Log comments whenever they change
  useEffect(() => {
    if (debug) {
      console.log('[CommentTestContent] Comments updated:', comments);
    }
  }, [comments, debug]);

  const handleLoadMoreReplies = (commentId: number) => {
    loadMoreReplies(commentId);
  };

  const handleRefresh = async () => {
    await refresh();
    setLastRefresh(new Date());
  };

  if (loading && comments.length === 0) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading comments...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
        <p className="text-sm text-red-500 mt-2">
          Please try again later or use a different document ID.
        </p>
        <Button variant="outlined" onClick={handleRefresh} className="mt-3">
          Try Again
        </Button>
      </div>
    );
  }

  // Count comments with replies and comments with more replies to load
  const commentsWithReplies = comments.filter((c) => c.replies?.length > 0);
  const commentsWithMoreReplies = comments.filter((c) => c.childrenCount > c.replies.length);

  // Find all nested comments with more replies to load
  const findNestedCommentsWithMoreReplies = (commentsToSearch: Comment[]): Comment[] => {
    let result: Comment[] = [];

    for (const comment of commentsToSearch) {
      if (comment.childrenCount > comment.replies.length) {
        result.push(comment);
      }

      if (comment.replies && comment.replies.length > 0) {
        result = [...result, ...findNestedCommentsWithMoreReplies(comment.replies)];
      }
    }

    return result;
  };

  const allCommentsWithMoreReplies = findNestedCommentsWithMoreReplies(comments);

  return (
    <div className="comment-test-content">
      <div className="mb-4 flex justify-between items-center">
        <Button variant="outlined" onClick={handleRefresh} size="sm">
          Refresh Comments
        </Button>
        <div className="text-xs text-gray-500">
          Last refreshed: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="p-4 text-center bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-700">No comments found for this document.</p>
          <p className="text-sm text-yellow-600 mt-2">Try a different document ID.</p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium mb-2">Comments ({comments.length})</h3>
            {debug && (
              <div className="bg-blue-50 p-2 text-xs border border-blue-100 rounded mb-3">
                <p>
                  <strong>Debug Info:</strong>
                </p>
                <p>Total Comments: {comments.length}</p>
                <p>Comments with Replies: {commentsWithReplies.length}</p>
                <p>
                  Top-level Comments with More Replies to Load: {commentsWithMoreReplies.length}
                </p>
                <p>All Comments with More Replies to Load: {allCommentsWithMoreReplies.length}</p>
                {allCommentsWithMoreReplies.length > 0 && (
                  <div className="mt-1">
                    <p>
                      <strong>Comments with more replies to load:</strong>
                    </p>
                    <ul className="list-disc pl-4">
                      {allCommentsWithMoreReplies.map((comment) => (
                        <li key={comment.id}>
                          ID: {comment.id} - Has {comment.replies.length} of {comment.childrenCount}{' '}
                          replies
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleLoadMoreReplies(comment.id)}
                            className="ml-2 py-0 h-6 text-xs"
                          >
                            Load
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <CommentList comments={comments} isRootList={true} contentType="paper" debug={debug} />
          </div>
        </>
      )}
    </div>
  );
};

export default CommentTestContent;
