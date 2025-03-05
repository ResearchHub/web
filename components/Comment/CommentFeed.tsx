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
import { MessageSquare } from 'lucide-react';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useSession } from 'next-auth/react';

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
  const { status } = useSession();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

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

  // Empty state component for when there are no comments
  const EmptyCommentState = ({ commentType }: { commentType: CommentType }) => {
    const message =
      commentType === 'REVIEW'
        ? 'No reviews yet.'
        : commentType === 'BOUNTY'
          ? 'No bounties yet.'
          : 'No comments yet. Start the conversation!';

    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-gray-100 p-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">{message}</h3>
        <p className="text-sm text-gray-500">Your contribution could help open science.</p>
      </div>
    );
  };

  // AuthenticatedCommentEditor component that shows a placeholder for unauthenticated users
  const AuthenticatedCommentEditor = ({ onSubmit, commentType, ...props }: CommentEditorProps) => {
    const { status } = useSession();

    // If user is authenticated, render the normal editor
    if (status === 'authenticated') {
      return <CommentEditor onSubmit={onSubmit} commentType={commentType} {...props} />;
    }

    // For unauthenticated users, show a placeholder that triggers auth modal when clicked
    return (
      <div
        className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:border-blue-500 transition-all duration-200 cursor-pointer"
        onClick={() => executeAuthenticatedAction(() => {})}
      >
        <div className="px-4 py-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gray-200"></div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 text-[15px]">
                <span className="text-gray-600">
                  Sign in to {commentType === 'REVIEW' ? 'review' : 'comment'}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 text-gray-500">
          {commentType === 'REVIEW' ? 'Share your thoughts on this paper...' : 'Add a comment...'}
        </div>
      </div>
    );
  };

  return (
    <div className={cn('comment-feed', className)}>
      {!hideEditor && (
        <div className="mb-6">
          <AuthenticatedCommentEditor
            onSubmit={handleSubmit}
            placeholder="Add a comment..."
            commentType={commentType}
            {...editorProps}
          />
          <div className="mt-12 mb-2">
            <CommentSortAndFilters commentType={commentType} commentCount={count} />
          </div>
          <div className="h-px bg-gray-200 my-4"></div>
        </div>
      )}

      <div className="comment-list-container">
        {loading && filteredComments.length === 0 ? (
          <CommentLoader count={3} />
        ) : filteredComments.length === 0 ? (
          <EmptyCommentState commentType={commentType || 'GENERIC_COMMENT'} />
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
