'use client';

import { useState, useEffect, useCallback } from 'react';
import { Comment, CommentType, UserVoteType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentEditor } from './CommentEditor';
import 'highlight.js/styles/atom-one-dark.css';
import { CommentCard } from './CommentCard';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import LoadMoreReplies from './LoadMoreReplies';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { CommentContent } from './lib/types';
import { AwardBountyModal } from '@/components/Comment/AwardBountyModal';
import { getDisplayBounty, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { BountyCardWrapper } from '@/components/Bounty/BountyCardWrapper';
import { useVote } from '@/hooks/useVote';

interface CommentItemProps {
  comment: Comment;
  contentType: ContentType;
  commentType?: CommentType;
  onCommentUpdate?: (newComment: Comment, parentId?: number) => void;
  onCommentDelete?: (commentId: number) => void;
  renderCommentActions?: boolean;
  debug?: boolean;
}

export const CommentItem = ({
  comment,
  contentType,
  commentType = 'GENERIC_COMMENT',
  onCommentUpdate,
  onCommentDelete,
  renderCommentActions = true,
  debug = false,
}: CommentItemProps) => {
  const { data: session } = useSession();
  const {
    updateComment,
    deleteComment,
    createReply,
    editingCommentId,
    replyingToCommentId,
    setEditingCommentId,
    setReplyingToCommentId,
    loading,
    forceRefresh,
    updateCommentVote,
  } = useComments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);

  // Log component lifecycle if debug is enabled
  useEffect(() => {
    if (debug) {
      console.log(`CommentItem ${comment.id} - MOUNTED`);
      return () => {
        console.log(`CommentItem ${comment.id} - UNMOUNTED`);
      };
    }
  }, [comment.id, debug]);

  // Add debug logging if debug is enabled
  useEffect(() => {
    if (debug) {
      console.log(`CommentItem ${comment.id} - isReplying: ${replyingToCommentId === comment.id}`);
      console.log(`CommentItem ${comment.id} - isEditing: ${editingCommentId === comment.id}`);
    }
  }, [comment.id, replyingToCommentId, editingCommentId, debug]);

  // Check if the comment has an open bounty
  const hasOpenBounty =
    comment.bounties && comment.bounties.length > 0 && comment.bounties.some(isOpenBounty);

  // Check if the current user is the author of the comment
  const isAuthor = session?.user?.id === comment.author?.id;

  // Determine if this comment is being edited or replied to
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;

  // Handle editing a comment
  const handleEdit = async (params: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }): Promise<boolean> => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Saving your changes...');

      if (debug) {
        console.log(`Editing comment ${comment.id} with content:`, params.content);
      }

      // Make the API call through the context
      const updatedComment = await updateComment(
        comment.id,
        params.content,
        typeof comment.parentId === 'number' ? comment.parentId : undefined
      );

      // Only clear the editing state after the API call completes
      setEditingCommentId(null);

      if (updatedComment) {
        // Call the onCommentUpdate callback if provided
        if (onCommentUpdate) {
          onCommentUpdate(
            updatedComment,
            typeof comment.parentId === 'number' ? comment.parentId : undefined
          );
        }

        // Show success toast
        toast.success('Comment updated successfully', { id: loadingToastId });
        return true;
      } else {
        // Show error toast
        toast.error('Failed to update comment', { id: loadingToastId });
        return false;
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
      return false;
    }
  };

  // Handle replying to a comment
  const handleReply = async (params: {
    content: CommentContent;
    rating?: number;
    sectionRatings?: Record<string, number>;
  }): Promise<boolean> => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Posting your reply...');

      if (debug) {
        console.log(`Replying to comment ${comment.id} with content:`, params.content);
      }

      // Make the API call through the context
      const newReply = await createReply(comment.id, params.content);

      // Only clear the replying state after the API call completes
      setReplyingToCommentId(null);

      if (newReply) {
        // Call the onCommentUpdate callback if provided
        if (onCommentUpdate) {
          onCommentUpdate(newReply, comment.id);
        }

        // Show success toast
        toast.success('Reply posted successfully', { id: loadingToastId });
        return true;
      } else {
        // Show error toast
        toast.error('Failed to post reply', { id: loadingToastId });
        return false;
      }
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error('Failed to post reply');
      return false;
    }
  };

  // Handle deleting a comment
  const handleDelete = async () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    try {
      // Show loading toast
      const loadingToastId = toast.loading('Deleting comment...');

      // Make the API call through the context
      await deleteComment(comment.id);

      // Call the onCommentDelete callback
      if (onCommentDelete) {
        onCommentDelete(comment.id);
      }

      // Show success toast
      toast.success('Comment deleted successfully!', { id: loadingToastId });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment. Please try again.');
    }
  };

  // Handle upvote
  const handleOnUpvote = useCallback(() => {
    // Determine the new vote type based on the current vote
    const newVoteType = comment.userVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';
    const newScore = newVoteType === 'UPVOTE' ? comment.score + 1 : comment.score - 1;

    updateCommentVote(comment.id, newVoteType, newScore);
  }, [comment, debug]);

  // Render the comment content based on whether it's being edited
  const renderContent = () => {
    // Check if this is a bounty comment
    const isBountyComment =
      comment.commentType === 'BOUNTY' ||
      (!!comment.bounties && Array.isArray(comment.bounties) && comment.bounties.length > 0);

    // If we're editing, show the editor
    if (isEditing) {
      return (
        <CommentEditor
          initialContent={comment.content}
          onSubmit={handleEdit}
          onCancel={() => setEditingCommentId(null)}
          autoFocus={true}
        />
      );
    }

    // For bounty comments, use BountyCardWrapper directly
    if (isBountyComment && comment.bounties) {
      if (debug) {
        console.log('Rendering bounty comment with BountyCardWrapper');
      }
      return (
        <div className="space-y-4">
          <BountyCardWrapper
            bounties={comment.bounties}
            content={comment.content}
            contentFormat={comment.contentFormat}
            documentId={comment.thread?.objectId}
            contentType={contentType || 'paper'}
            commentId={comment.id}
            userVote={comment.userVote}
            score={comment.score}
            showFooter={true}
            showActions={renderCommentActions}
            onUpvote={handleOnUpvote}
            onReply={() => setReplyingToCommentId(comment.id)}
            onReport={() => {
              // Report functionality
              toast.success('Comment reported');
            }}
            onEdit={() => {
              if (debug) console.log(`Setting editingCommentId to ${comment.id}`);
              setEditingCommentId(comment.id);
            }}
            onDelete={() => handleDelete()}
          />
        </div>
      );
    }

    // For regular comments, use CommentCard

    return (
      <div className="space-y-4">
        {/* Render the comment card with all necessary callbacks */}
        <CommentCard
          comment={comment}
          isReplying={isReplying}
          onCancelReply={() => setReplyingToCommentId(null)}
          onSubmitReply={handleReply}
          onUpvote={handleOnUpvote}
          onReply={() => setReplyingToCommentId(comment.id)}
          onReport={() => {
            if (debug) console.log('Report clicked for comment:', comment.id);
          }}
          onShare={() => {
            // Copy the link to the clipboard
            const url =
              window.location.origin + `/comment/${comment.thread?.objectId}/${comment.id}`;
            navigator.clipboard.writeText(url).then(() => {
              toast.success('Link copied to clipboard');
            });
          }}
          onEdit={() => {
            if (debug) console.log(`Setting editingCommentId to ${comment.id}`);
            setEditingCommentId(comment.id);
          }}
          onDelete={() => handleDelete()}
          showActions={renderCommentActions}
        />
      </div>
    );
  };

  return (
    <div className="py-4 mb-2" id={`comment-${comment.id}`}>
      <style jsx global>{`
        /* Comment Content Styles */
        .prose blockquote {
          border-left: 4px solid #e5e7eb;
          padding-left: 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #4b5563;
        }

        .prose blockquote p {
          margin: 0;
        }

        .prose blockquote blockquote {
          border-left-color: #d1d5db;
          margin-left: 0.5rem;
        }

        /* List styles */
        .prose ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin: 1rem 0;
        }

        .prose li {
          margin: 0.5rem 0;
        }

        .prose li > ul,
        .prose li > ol {
          margin: 0.5rem 0;
        }

        /* Code block styles */
        .prose pre {
          background-color: rgb(40, 44, 52);
          color: rgb(171, 178, 191);
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .prose pre code {
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono',
            'Courier New', monospace;
          font-size: 0.875rem;
          line-height: 1.5;
          background: none;
          padding: 0;
          margin: 0;
          border-radius: 0;
          box-shadow: none;
        }

        /* Import highlight.js theme */
        @import 'highlight.js/styles/atom-one-dark.css';
      `}</style>

      {/* Debug information */}
      {debug && (
        <div className="bg-gray-100 p-2 mb-2 rounded text-xs font-mono">
          <div>
            <strong>Comment ID:</strong> {comment.id}
          </div>
          <div>
            <strong>Parent ID:</strong> {comment.parentId || 'none'}
          </div>
          <div>
            <strong>Format:</strong> {comment.contentFormat}
          </div>
          <div>
            <strong>Type:</strong> {commentType}
          </div>
          <div>
            <strong>Author:</strong> {comment.author?.name || 'Unknown'}
          </div>
          <div>
            <strong>Created:</strong> {comment.createdDate?.toString()}
          </div>
          <div>
            <strong>isEditing:</strong> {isEditing ? 'true' : 'false'}
          </div>
          <div>
            <strong>isReplying:</strong> {isReplying ? 'true' : 'false'}
          </div>
          <div>
            <strong>Replies:</strong> {comment.replies?.length || 0}
          </div>
          {comment.metadata && (
            <div>
              <strong>Metadata:</strong> {JSON.stringify(comment.metadata)}
            </div>
          )}
        </div>
      )}

      {/* Comment content */}
      {renderContent()}

      {/* Replies section */}
      {comment.replies && comment.replies.length > 0 ? (
        <div className="mt-4 pl-6 border-l border-gray-200">
          {debug && (
            <div className="bg-blue-50 p-2 mb-2 rounded text-xs font-mono">
              <div>
                <strong>
                  Rendering {comment.replies.length} replies for comment {comment.id}
                </strong>
              </div>
              <div>
                <strong>Reply IDs:</strong> {comment.replies.map((r) => r.id).join(', ')}
              </div>
              <div>
                <strong>Parent ID:</strong> {comment.id}
              </div>
              <div>
                <strong>Children Count:</strong> {comment.childrenCount}
              </div>
              <div>
                <strong>Should Show Load More:</strong>{' '}
                {comment.childrenCount > comment.replies.length ? 'Yes' : 'No'}
              </div>
            </div>
          )}
          {comment.replies.map((reply) => (
            <CommentItem
              key={`reply-${reply.id}`}
              comment={{
                ...reply,
                parentId: comment.id, // Ensure the parentId is explicitly set
              }}
              contentType={contentType}
              commentType={commentType}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
              renderCommentActions={renderCommentActions}
              debug={debug}
            />
          ))}

          {/* Load More Replies button */}
          {comment.childrenCount > comment.replies.length && (
            <div className="mt-2">
              {debug && (
                <div className="bg-green-50 p-2 mb-2 rounded text-xs font-mono">
                  <div>
                    <strong>Load More Button Debug:</strong>
                  </div>
                  <div>Comment ID: {comment.id}</div>
                  <div>Children Count: {comment.childrenCount}</div>
                  <div>Replies Length: {comment.replies.length}</div>
                  <div>Remaining: {comment.childrenCount - comment.replies.length}</div>
                </div>
              )}
              <LoadMoreReplies
                commentId={comment.id}
                remainingCount={comment.childrenCount - comment.replies.length}
                isLoading={loading}
                debug={debug}
              />
            </div>
          )}
        </div>
      ) : comment.childrenCount > 0 ? (
        // No replies loaded yet, but there are replies to load
        <div className="mt-4 pl-6 border-l border-gray-200">
          {debug && (
            <div className="bg-orange-50 p-2 mb-2 rounded text-xs font-mono">
              <div>
                <strong>No replies loaded yet</strong>
              </div>
              <div>Comment ID: {comment.id}</div>
              <div>Children Count: {comment.childrenCount}</div>
              <div>Should Show Load More: Yes</div>
            </div>
          )}
          <div className="mt-2">
            <LoadMoreReplies
              commentId={comment.id}
              remainingCount={comment.childrenCount}
              isLoading={loading}
              debug={debug}
            />
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      {/* Award Bounty Modal for bounty comments */}
      {comment.commentType === 'BOUNTY' &&
        comment.bounties &&
        comment.bounties.length > 0 &&
        !!getDisplayBounty(comment.bounties) && (
          <AwardBountyModal
            isOpen={showAwardModal}
            onClose={() => setShowAwardModal(false)}
            comment={comment}
            contentType={contentType}
            onBountyUpdated={() => {
              // Refresh the comments using the context
              forceRefresh();

              // Also call the parent's onCommentUpdate if provided
              if (onCommentUpdate) {
                onCommentUpdate(comment);
              }
            }}
          />
        )}
    </div>
  );
};
