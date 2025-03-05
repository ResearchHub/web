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
import CommentList from './CommentList';
import { toast } from 'react-hot-toast';
import { CommentContent } from './lib/types';

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
    <CommentProvider
      documentId={documentId}
      contentType={contentType}
      commentType={commentType}
      debug={debug}
    >
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
    filteredComments,
    count,
    loading,
    error,
    createComment,
    loadMore,
    updateComment,
    deleteComment,
    sortBy,
    setSortBy,
    filter,
    setFilter,
    bountyFilter,
    setBountyFilter,
  } = useCommentsContext();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async ({
    content,
    rating: overallRating,
    sectionRatings,
  }: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }) => {
    setIsSubmitting(true);
    // Show loading toast
    const toastId = toast.loading('Submitting comment...');

    try {
      const result = await createComment(content, overallRating);
      if (result !== null) {
        toast.success('Comment submitted successfully!', { id: toastId });
        return true; // Return true if comment was created successfully
      } else {
        toast.error('Failed to submit comment. Please try again.', { id: toastId });
        return false; // Return false if there was an error
      }
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to submit comment. Please try again.', { id: toastId });
      return false; // Return false if there was an error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCommentUpdate = (newComment: Comment, parentId?: number) => {
    updateComment(newComment.id, newComment.content, parentId);
  };

  const handleCommentDelete = (commentId: number) => {
    deleteComment(commentId);
  };

  const handleLoadMore = async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  };

  return (
    <div className={cn('comment-feed', className)}>
      {!hideEditor && (
        <div className="mb-6">
          <CommentEditor
            onSubmit={handleSubmit}
            placeholder="Add a comment..."
            commentType={commentType}
            {...editorProps}
          />
          <div className="mt-12 mb-2">
            <CommentSortAndFilters commentType={commentType} commentCount={0} />
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
        </div>
      )}

      <div className="comment-list-container">
        {loading && filteredComments.length === 0 ? (
          <CommentLoader count={3} />
        ) : (
          <>
            <CommentList
              comments={filteredComments}
              isRootList={true}
              contentType={contentType}
              debug={debug}
            />

            {filteredComments.length < count && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outlined"
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="w-full md:w-auto"
                >
                  {loading
                    ? 'Loading...'
                    : `Load More (${count - filteredComments.length} remaining)`}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
