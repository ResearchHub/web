'use client';

import { useCallback, useState } from 'react';
import { Comment, CommentType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentItem } from './CommentItem';
import { CommentEditor, CommentEditorProps } from './CommentEditor';
import { Button } from '@/components/ui/Button';
import { CommentProvider, useComments as useCommentsContext } from '@/contexts/CommentContext';
import { cn } from '@/utils/styles';
import { CommentSortAndFilters } from './CommentSortAndFilters';
import { CommentLoader } from './CommentLoader';

interface CommentFeedProps {
  documentId: number;
  contentType: ContentType;
  className?: string;
  commentType?: CommentType;
  editorProps?: Partial<CommentEditorProps>;
  renderBountyAwardActions?: (comment: Comment) => React.ReactNode;
  renderCommentActions?: boolean;
  hideEditor?: boolean;
  debug?: boolean;
}

export const CommentFeed = ({
  documentId,
  contentType,
  className,
  commentType = 'GENERIC_COMMENT',
  editorProps = {},
  renderBountyAwardActions,
  renderCommentActions = true,
  hideEditor = false,
  debug = false,
}: CommentFeedProps) => {
  return (
    <CommentProvider documentId={documentId} contentType={contentType} commentType={commentType}>
      <CommentFeedContent
        className={className}
        editorProps={editorProps}
        renderBountyAwardActions={renderBountyAwardActions}
        renderCommentActions={renderCommentActions}
        hideEditor={hideEditor}
        commentType={commentType}
        contentType={contentType}
        debug={debug}
      />
    </CommentProvider>
  );
};

const CommentFeedContent = ({
  className,
  editorProps = {},
  renderBountyAwardActions,
  renderCommentActions = true,
  hideEditor = false,
  commentType,
  contentType,
  debug = false,
}: Omit<CommentFeedProps, 'documentId'>) => {
  const {
    comments,
    count,
    loading,
    error,
    createComment,
    loadMore,
    updateComment,
    deleteComment,
    filteredComments,
  } = useCommentsContext();

  const [loadingMore, setLoadingMore] = useState(false);

  const handleSubmit = async ({
    content,
    rating: overallRating,
  }: {
    content: any;
    rating?: number;
  }) => {
    try {
      await createComment(content, overallRating);
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleCommentUpdate = useCallback(
    async (newComment: Comment, parentId?: number) => {
      try {
        await updateComment(newComment.id, newComment.content, parentId);
      } catch (error) {
        console.error('Error updating comment:', error);
      }
    },
    [updateComment]
  );

  const handleCommentDelete = useCallback(
    async (commentId: number) => {
      try {
        await deleteComment(commentId);
      } catch (error) {
        console.error('Error deleting comment:', error);
      }
    },
    [deleteComment]
  );

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more comments:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      <CommentSortAndFilters commentType={commentType} commentCount={count} />

      {!hideEditor && (
        <CommentEditor
          onSubmit={handleSubmit}
          placeholder={
            commentType === 'BOUNTY'
              ? 'Post a bounty to get answers to your questions...'
              : commentType === 'REVIEW'
                ? 'Write a review...'
                : 'Write a comment...'
          }
          commentType={commentType}
          {...editorProps}
        />
      )}

      {loading && comments.length === 0 ? (
        <CommentLoader commentType={commentType} />
      ) : error ? (
        <div className="text-center py-8 text-red-500">
          <p>Error loading comments: {error}</p>
          {debug && <pre className="mt-2 text-xs text-left">{JSON.stringify(error, null, 2)}</pre>}
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>
            {commentType === 'BOUNTY'
              ? 'No bounties yet. Be the first to post a bounty!'
              : commentType === 'REVIEW'
                ? 'No reviews yet. Be the first to write a review!'
                : 'No comments yet. Be the first to comment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              contentType={contentType}
              commentType={commentType}
              onCommentUpdate={handleCommentUpdate}
              onCommentDelete={handleCommentDelete}
              renderCommentActions={renderCommentActions}
              debug={debug}
            />
          ))}

          {comments.length < count && (
            <>
              {loadingMore ? (
                <CommentLoader count={1} commentType={commentType} />
              ) : (
                <div className="flex justify-center mt-4">
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="flex items-center gap-1"
                  >
                    <span>Load More</span>
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
