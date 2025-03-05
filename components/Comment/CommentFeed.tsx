'use client';

import { useCallback, useState, useEffect, memo } from 'react';
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
import { CommentEmptyState } from './CommentEmptyState';
import { CreateBountyModal } from '@/components/modals/CreateBountyModal';

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

function CommentFeed({
  documentId,
  contentType,
  className,
  commentType = 'GENERIC_COMMENT',
  editorProps = {},
  renderBountyAwardActions,
  renderCommentActions = true,
  hideEditor = false,
  debug = false,
}: CommentFeedProps) {
  console.log(`CommentFeed RENDER - type: ${commentType}, docId: ${documentId}`);

  // Add debugging for mount/unmount
  useEffect(() => {
    console.log(`CommentFeed MOUNTED - type: ${commentType}, docId: ${documentId}`);
    return () => {
      console.log(`CommentFeed UNMOUNTED - type: ${commentType}, docId: ${documentId}`);
    };
  }, [commentType, documentId]);

  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);

  const handleCreateBounty = useCallback(() => {
    setIsBountyModalOpen(true);
  }, []);

  const handleCloseBountyModal = useCallback(() => {
    setIsBountyModalOpen(false);
  }, []);

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
        onCreateBounty={handleCreateBounty}
      />
      <CreateBountyModal
        isOpen={isBountyModalOpen}
        onClose={handleCloseBountyModal}
        workId={documentId.toString()}
      />
    </CommentProvider>
  );
}

// Remove memo wrapper but keep useCallback optimizations
function CommentFeedContent({
  className,
  editorProps = {},
  renderBountyAwardActions,
  renderCommentActions = true,
  hideEditor = false,
  commentType,
  contentType,
  debug = false,
  onCreateBounty,
}: Omit<CommentFeedProps, 'documentId'> & { onCreateBounty: () => void }) {
  // Add debugging for content component
  useEffect(() => {
    console.log(`CommentFeedContent MOUNTED - type: ${commentType}`);
    return () => {
      console.log(`CommentFeedContent UNMOUNTED - type: ${commentType}`);
    };
  }, [commentType]);

  const {
    filteredComments,
    count,
    loading,
    error,
    createComment,
    loadMore,
    updateComment,
    deleteComment,
  } = useCommentsContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const { status } = useSession();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleSubmit = useCallback(
    async ({
      content,
      rating: overallRating,
      sectionRatings,
    }: {
      content: CommentContent;
      rating?: number;
      sectionRatings?: Record<string, number>;
    }) => {
      setIsSubmitting(true);
      const toastId = toast.loading('Submitting comment...');

      try {
        const result = await createComment(content, overallRating);

        if (!result) {
          toast.error('Failed to submit comment. Please try again.', { id: toastId });
          return false;
        }

        if (commentType === 'REVIEW' && overallRating !== undefined && result) {
          try {
            await CommentService.createCommunityReview({
              unifiedDocumentId: result.thread.objectId,
              commentId: result.id,
              score: overallRating,
            });

            result.score = overallRating;
            toast.success('Review submitted successfully!', { id: toastId });
          } catch (reviewError) {
            console.error('Error creating community review:', reviewError);
            toast.success('Comment submitted, but review data could not be saved.', {
              id: toastId,
            });
          }
        } else {
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
    },
    [commentType, createComment]
  );

  const handleCommentUpdate = useCallback(
    (newComment: Comment, parentId?: number) => {
      updateComment(newComment.id, newComment.content, parentId);
    },
    [updateComment]
  );

  const handleCommentDelete = useCallback(
    (commentId: number) => {
      deleteComment(commentId);
    },
    [deleteComment]
  );

  const handleLoadMore = useCallback(async () => {
    try {
      await loadMore();
    } catch (error) {
      console.error('Error loading more comments:', error);
    }
  }, [loadMore]);

  // Handle bounty creation
  const handleCreateBounty = useCallback(() => {
    onCreateBounty();
  }, [onCreateBounty]);

  // AuthenticatedCommentEditor component
  const AuthenticatedCommentEditor = useCallback(
    ({ onSubmit, commentType, ...props }: CommentEditorProps) => {
      const { status } = useSession();

      if (status === 'authenticated') {
        return <CommentEditor onSubmit={onSubmit} commentType={commentType} {...props} />;
      }

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
    },
    [executeAuthenticatedAction]
  );

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
          <CommentLoader count={3} commentType={commentType} />
        ) : filteredComments.length === 0 ? (
          <CommentEmptyState
            commentType={commentType || 'GENERIC_COMMENT'}
            onCreateBounty={handleCreateBounty}
          />
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
}

export { CommentFeed };
