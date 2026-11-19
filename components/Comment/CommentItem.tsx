'use client';

import { useState, useCallback } from 'react';
import { Comment, CommentType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentEditor } from './CommentEditor';
import 'highlight.js/styles/atom-one-dark.css';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import LoadMoreReplies from './LoadMoreReplies';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { CommentContent } from './lib/types';
import { AwardBountyModal } from '@/components/Comment/AwardBountyModal';
import { canManageBounties } from '@/components/Bounty/lib/bountyUtil';
import { CommentRow } from '@/components/Comment/CommentRow';
import { transformBountyCommentToFeedItem } from '@/types/feed';
import { FeedItemBountyComment } from '@/components/Feed/items/FeedItemBountyComment';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { ID } from '@/types/root';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

/**
 * One line of a comment's thread. Replies show one level deep under the comment
 * they belong to, so replies to replies are flattened into the same column in
 * reading order, each remembering who it answers.
 */
type ThreadEntry =
  | { kind: 'reply'; comment: Comment; parent: Comment }
  | { kind: 'more'; parentId: number; remaining: number };

const flattenThread = (parent: Comment): ThreadEntry[] => {
  const entries: ThreadEntry[] = [];
  for (const reply of parent.replies ?? []) {
    entries.push({ kind: 'reply', comment: { ...reply, parentId: parent.id }, parent });
    entries.push(...flattenThread(reply));
  }
  const loaded = parent.replies?.length ?? 0;
  if (parent.childrenCount > loaded) {
    entries.push({ kind: 'more', parentId: parent.id, remaining: parent.childrenCount - loaded });
  }
  return entries;
};

/** The curved line joining the thread to an entry, from under the parent's avatar. */
const ThreadConnector = ({
  isLast,
  elbowClassName,
}: {
  isLast: boolean;
  elbowClassName: string;
}) => (
  <>
    {!isLast && (
      <span aria-hidden="true" className="absolute -left-7 top-0 bottom-0 w-px bg-gray-300" />
    )}
    <span
      aria-hidden="true"
      className={cn(
        'absolute -left-7 top-0 w-6 rounded-bl-[10px] border-b border-l border-gray-300',
        elbowClassName
      )}
    />
  </>
);

// Define the SolutionViewEvent interface (previously in BountyCard)
interface SolutionViewEvent {
  solutionId: ID;
  authorName: string;
  awardedAmount?: string;
}

interface CommentItemProps {
  comment: Comment;
  contentType: ContentType;
  commentType?: CommentType;
  onCommentUpdate?: (newComment: Comment, parentId?: number) => void;
  onCommentDelete?: (commentId: number) => void;
  showTooltips?: boolean;
  includeReplies?: boolean;
  showDebugInfo?: boolean;
  readOnly?: boolean;
  /** Set on a reply drawn inside its top-level comment's flattened thread. */
  isThreadReply?: boolean;
  /** For a reply to a reply: the name of the person it answers. */
  replyingTo?: string;
}

export const CommentItem = ({
  comment,
  contentType,
  commentType = 'GENERIC_COMMENT',
  onCommentUpdate,
  onCommentDelete,
  showTooltips = true,
  includeReplies = true,
  showDebugInfo = false,
  readOnly = false,
  isThreadReply = false,
  replyingTo,
}: CommentItemProps) => {
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
    bountyFilter,
    workContentType,
    work,
  } = useComments();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBountyId, setSelectedBountyId] = useState<number | undefined>(undefined);
  const [selectedSolution, setSelectedSolution] = useState<SolutionViewEvent | null>(null);

  const { user } = useUser();
  // Check if the current user is the author of the comment
  const isAuthor = user?.authorProfile?.id === comment?.createdBy?.authorProfile?.id;
  const canAwardBounty = canManageBounties(user);

  // Determine if this comment is being edited or replied to
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;
  const isReply = isThreadReply || typeof comment.parentId === 'number';
  // Bounties keep their own card, reply box and plain indented thread.
  const isBountyComment =
    comment.commentType === 'BOUNTY' ||
    (!!comment.bounties && Array.isArray(comment.bounties) && comment.bounties.length > 0);
  // Only a top-level comment draws a thread; its replies come flattened beneath it.
  const threadEntries = includeReplies && !isThreadReply ? flattenThread(comment) : [];
  const isRootReplying = isReplying && !isThreadReply && !readOnly && !isBountyComment;
  const hasThread = threadEntries.length > 0 || isRootReplying;

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

  // Render the comment content based on whether it's being edited
  const renderContent = () => {
    const isLegacyComment = comment.contentFormat === 'QUILL_EDITOR';

    // If we're editing and the comment is not a legacy comment(QUILL_EDITOR), show the editor
    if (isEditing && !isLegacyComment && !readOnly) {
      return (
        <CommentEditor
          initialContent={comment.content}
          commentType={comment.commentType}
          onSubmit={handleEdit}
          onCancel={() => setEditingCommentId(null)}
          autoFocus={true}
          initialRating={comment.reviewScore}
          editing={isEditing}
        />
      );
    }

    if (isBountyComment && comment.bounties) {
      try {
        const feedEntry = transformBountyCommentToFeedItem(comment, contentType, work);

        const customHref = undefined; // Setting to undefined to prevent navigation

        return (
          <div className="space-y-4">
            <FeedItemBountyComment
              entry={feedEntry}
              showSolutions={true}
              showRelatedWork={false}
              href={customHref}
              hideActions={readOnly || comment.isRemoved}
              showTooltips={showTooltips}
              isAuthor={isAuthor}
              showCreatorActions={!readOnly && isAuthor}
              canAwardBounty={!readOnly && canAwardBounty}
              showContributeButton={false}
              showSupportAndCTAButtons={!readOnly}
              onAward={
                readOnly
                  ? undefined
                  : (bountyId) => {
                      setSelectedBountyId(bountyId);
                      setShowAwardModal(true);
                    }
              }
              onEdit={readOnly ? undefined : () => setEditingCommentId(comment.id)}
              onReply={readOnly ? undefined : () => setReplyingToCommentId(comment.id)}
              onContributeSuccess={() => {
                // After successful contribution, refresh the comments
                forceRefresh();

                // Also call the parent's onCommentUpdate if provided
                if (onCommentUpdate) {
                  onCommentUpdate(comment);
                }
              }}
              actionLabels={{
                comment: 'Reply',
              }}
              onViewSolution={(event) => {
                setSelectedSolution({
                  solutionId: event.solutionId,
                  authorName: event.authorName,
                  awardedAmount: event.awardedAmount,
                });
              }}
            />

            {/* If we're replying, show the reply editor */}
            {isReplying && !readOnly && (
              <div className="mt-4 border-t pt-4 px-4 pb-4">
                <h4 className="text-sm font-medium mb-2">Your reply:</h4>
                <CommentEditor
                  onSubmit={handleReply}
                  onCancel={() => setReplyingToCommentId(null)}
                  placeholder="Write your reply..."
                  autoFocus={true}
                  isBountyReply={true}
                />
              </div>
            )}
          </div>
        );
      } catch (error) {
        console.error('Error transforming bounty comment to feed item:', error);

        // Fallback to a simple error message
        return (
          <div className="p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
            <p>There was an error displaying this bounty. Please refresh the page and try again.</p>
          </div>
        );
      }
    }

    return (
      <CommentRow
        comment={comment}
        isReply={isReply}
        work={work}
        contentType={contentType}
        onReply={readOnly ? undefined : () => setReplyingToCommentId(comment.id)}
        onEdit={readOnly ? undefined : () => setEditingCommentId(comment.id)}
        onDelete={readOnly ? undefined : () => handleDelete()}
        hideActions={readOnly || (!includeReplies && !isThreadReply)}
        workContentType={workContentType}
        replyingTo={replyingTo}
        showThreadLine={hasThread}
      >
        {/* A reply's own reply box opens under it; the top-level one opens at the thread's end. */}
        {isReplying && isThreadReply && !readOnly && renderReplyEditor(false)}
      </CommentRow>
    );
  };

  const renderReplyEditor = (isBountyReply: boolean) => (
    <div className="mt-3" data-testid="comment-reply-editor">
      <CommentEditor
        onSubmit={handleReply}
        onCancel={() => setReplyingToCommentId(null)}
        placeholder="Add a reply…"
        autoFocus={true}
        isBountyReply={isBountyReply}
      />
    </div>
  );

  return (
    <div id={`comment-${comment.id}`} data-testid="comment-item">
      {/* Debug information for comment ID */}
      {showDebugInfo && (
        <div className="bg-gray-100 p-2 mb-2 rounded-md border border-gray-300">
          <span className="text-lg font-bold text-gray-700">Comment ID: {comment.id}</span>
          {comment.parentId && (
            <span className="ml-3 text-sm text-gray-500">(Reply to: {comment.parentId})</span>
          )}
        </div>
      )}

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
          font-family:
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
            monospace;
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

      {/* The thread: every reply one level in, joined to the comment by a curved line. */}
      {hasThread && (
        <div className={isBountyComment ? 'ml-6 mt-2 border-l border-gray-200 pl-6' : 'ml-12'}>
          {threadEntries.map((entry, index) => {
            const isLast = index === threadEntries.length - 1 && !isRootReplying;
            if (entry.kind === 'more') {
              return (
                <div key={`more-${entry.parentId}`} className="relative pt-3">
                  {!isBountyComment && (
                    <ThreadConnector isLast={isLast} elbowClassName="h-[22px]" />
                  )}
                  <LoadMoreReplies
                    commentId={entry.parentId}
                    remainingCount={entry.remaining}
                    isLoading={loading}
                  />
                </div>
              );
            }
            return (
              <div key={`reply-${entry.comment.id}`} className="relative pt-4">
                {!isBountyComment && <ThreadConnector isLast={isLast} elbowClassName="h-8" />}
                <CommentItem
                  comment={entry.comment}
                  contentType={contentType}
                  commentType={commentType}
                  onCommentUpdate={onCommentUpdate}
                  onCommentDelete={onCommentDelete}
                  showTooltips={showTooltips}
                  includeReplies={false}
                  readOnly={readOnly}
                  isThreadReply
                  replyingTo={
                    entry.parent.id === comment.id
                      ? undefined
                      : entry.parent.createdBy?.authorProfile?.fullName
                  }
                />
              </div>
            );
          })}
          {isRootReplying && (
            <div className="relative pt-1">
              <ThreadConnector isLast elbowClassName="h-8" />
              {renderReplyEditor(false)}
            </div>
          )}
        </div>
      )}

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
      {showAwardModal && (
        <AwardBountyModal
          isOpen={showAwardModal}
          onClose={() => {
            setShowAwardModal(false);
            setSelectedBountyId(undefined);
          }}
          comment={comment}
          contentType={contentType}
          bountyId={selectedBountyId}
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
      {selectedSolution && (
        <SolutionModal
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
          commentId={selectedSolution.solutionId}
          documentId={comment.thread?.objectId || 0}
          contentType={contentType || 'paper'} // Default to paper for compatibility
          solutionAuthorName={selectedSolution.authorName}
          awardedAmount={selectedSolution.awardedAmount}
        />
      )}
    </div>
  );
};
