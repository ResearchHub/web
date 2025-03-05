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
import { CommentService } from '@/services/comment.service';

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
  console.log('commentType', commentType);

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
      // Step 1: Create the comment
      const result = await createComment(content, overallRating);

      if (!result) {
        toast.error('Failed to submit comment. Please try again.', { id: toastId });
        return false;
      }

      // Step 2: If this is a review, create the community review
      if (commentType === 'REVIEW' && overallRating !== undefined && result) {
        try {
          // Call the createCommunityReview function
          await CommentService.createCommunityReview({
            unifiedDocumentId: result.thread.objectId,
            commentId: result.id,
            score: overallRating,
          });

          // Instead of immediately updating the comment, we'll set the score directly on the result
          // This ensures the comment is displayed with the correct score from the beginning
          result.score = overallRating;

          toast.success('Review submitted successfully!', { id: toastId });
        } catch (reviewError) {
          console.error('Error creating community review:', reviewError);
          // We don't want to fail the whole operation if just the review part fails
          // The comment was still created successfully
          toast.success('Comment submitted, but review data could not be saved.', { id: toastId });
        }
      } else {
        // Regular comment was created successfully
        toast.success('Comment submitted successfully!', { id: toastId });
      }

      return true;
    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Failed to submit comment. Please try again.', { id: toastId });
      return false;
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
