'use client';

import { useState, useCallback } from 'react';
import { CommentType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentEditor } from './CommentEditor';
import 'highlight.js/styles/atom-one-dark.css';
import { FeedItemComment } from '@/components/Feed/items/FeedItemComment';
import { FeedItemBounty } from '@/components/Feed/items/FeedItemBounty';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import LoadMoreReplies from './LoadMoreReplies';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { CommentContent } from './lib/types';
import { AwardBountyModal } from '@/components/Comment/AwardBountyModal';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { SolutionViewEvent } from '@/components/Bounty/BountyCard';
import { getDisplayBounty, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { getCommentFromFeedEntry, createFeedEntryFromComment } from '@/utils/feedUtils';

interface CommentItemProps {
  feedEntry: FeedEntry;
  contentType: ContentType;
  commentType?: CommentType;
  onCommentUpdate?: (newComment: any, parentId?: number) => void;
  onCommentDelete?: (commentId: number) => void;
}

export const CommentItem = ({
  feedEntry,
  contentType,
  commentType = 'GENERIC_COMMENT',
  onCommentUpdate,
  onCommentDelete,
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
    feedEntries,
  } = useComments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState<SolutionViewEvent | null>(null);

  // Extract the comment from the feedEntry
  const comment = getCommentFromFeedEntry(feedEntry);

  if (!comment) {
    return null; // Return early if no comment can be extracted
  }

  // Check if the current user is the author of the comment
  const isAuthor = session?.user?.authorProfile?.id === comment.author?.id;
  console.log('isAuthor', isAuthor);
  console.log('session', session);

  console.log('session?.user?.authorProfile?.id', session?.user?.authorProfile?.id);
  console.log('comment.author', comment.author);

  console.log('comment.author', comment.author);
  const renderCommentActions = isAuthor;

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
  }, [comment, updateCommentVote]);

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

    // For bounty comments, use FeedItemBounty directly
    if (isBountyComment && feedEntry.contentType === 'BOUNTY') {
      const bountyContent = feedEntry.content as FeedBountyContent;
      const bounty = bountyContent.bounty;

      if (!bounty) {
        return null;
      }

      return (
        <div className="space-y-4">
          <FeedItemBounty
            entry={feedEntry}
            relatedDocumentId={comment.thread?.objectId || bountyContent.relatedDocumentId}
            showSolutions={true}
            showRelatedWork={true}
            onReply={() => setReplyingToCommentId(comment.id)}
          />
        </div>
      );
    }
    console.log('render', renderCommentActions);
    console.log('11');
    // For regular comments, use FeedItemComment with the provided feedEntry
    return (
      <div className="space-y-4">
        {/* Render the FeedItemComment with all necessary callbacks */}
        <FeedItemComment
          entry={feedEntry}
          onReply={() => setReplyingToCommentId(comment.id)}
          onEdit={() => setEditingCommentId(comment.id)}
          onDelete={() => handleDelete()}
          showActions={renderCommentActions}
        />

        {/* If replying, show the editor */}
        {isReplying && (
          <div className="mt-4 pl-6 border-l border-gray-200">
            <CommentEditor
              onSubmit={handleReply}
              onCancel={() => setReplyingToCommentId(null)}
              autoFocus={true}
              placeholder="Write a reply..."
            />
          </div>
        )}
      </div>
    );
  };

  // Find feed entries for replies
  const findReplyFeedEntries = (replyId: number) => {
    return feedEntries.find((entry) => {
      const entryComment = getCommentFromFeedEntry(entry);
      return entryComment?.id === replyId;
    });
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

      {/* Comment content */}
      {renderContent()}

      {/* Replies section */}
      {comment.replies && comment.replies.length > 0 ? (
        <div className="mt-4 pl-6 border-l border-gray-200">
          {comment.replies.map((reply) => {
            // Find the corresponding feed entry for this reply
            const replyFeedEntry = findReplyFeedEntries(reply.id);

            // If we can't find a feed entry, create one
            const feedEntryToUse =
              replyFeedEntry ||
              createFeedEntryFromComment({
                ...reply,
                parentId: comment.id, // Ensure the parentId is explicitly set
              });

            return (
              <CommentItem
                key={`reply-${reply.id}`}
                feedEntry={feedEntryToUse}
                contentType={contentType}
                commentType={commentType}
                onCommentUpdate={onCommentUpdate}
                onCommentDelete={onCommentDelete}
              />
            );
          })}

          {/* Load More Replies button */}
          {comment.childrenCount > comment.replies.length && (
            <div className="mt-2">
              <LoadMoreReplies
                commentId={comment.id}
                remainingCount={comment.childrenCount - comment.replies.length}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      ) : comment.childrenCount > 0 ? (
        // No replies loaded yet, but there are replies to load
        <div className="mt-4 pl-6 border-l border-gray-200">
          <div className="mt-2">
            <LoadMoreReplies
              commentId={comment.id}
              remainingCount={comment.childrenCount}
              isLoading={loading}
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

      {/* Solution Modal */}
      {selectedSolution && feedEntry.contentType === 'BOUNTY' && (
        <SolutionModal
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
          commentId={selectedSolution.solutionId}
          documentId={
            comment.thread?.objectId ||
            (feedEntry.content as FeedBountyContent).relatedDocumentId ||
            0
          }
          contentType={
            contentType ||
            (feedEntry.content as FeedBountyContent).relatedDocumentContentType ||
            'paper'
          }
          solutionAuthorName={selectedSolution.authorName}
          awardedAmount={selectedSolution.awardedAmount}
        />
      )}
    </div>
  );
};
