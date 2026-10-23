'use client';

import { useState, useMemo } from 'react';
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
import { toCommentAuthor, transformCommentToFeedItem } from '@/types/feed';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { BountyActionRow } from '@/components/Bounty/BountyActionRow';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { PrimaryActionSection } from '@/components/Feed/BaseFeedItem';
import { calculateTotalAwardedAmount, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { ID } from '@/types/root';
import { useUser } from '@/contexts/UserContext';
import { ACTIVITY_ROW_DIVIDER } from '@/components/Activity/cards/ActivityCardShell';
import { cn } from '@/utils/styles';
import { CommentCard } from './CommentCard';
import type { AuthorProfile } from '@/types/authorProfile';

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
  /** 0 for a thread's first comment, 1+ for the replies listed under it. */
  depth?: number;
  /** Whose comment a reply at depth 2+ answers. */
  replyTo?: AuthorProfile;
}

type FlatReply =
  | { kind: 'reply'; reply: Comment; parent: Comment; depth: number }
  | { kind: 'more'; parent: Comment; remaining: number };

/**
 * A thread's replies at every depth as one list, in reading order: each reply, then
 * the replies under it, then the button for any of its replies not loaded yet.
 */
function flattenReplies(root: Comment): FlatReply[] {
  const items: FlatReply[] = [];
  const walk = (parent: Comment, depth: number) => {
    for (const reply of parent.replies ?? []) {
      items.push({ kind: 'reply', reply: { ...reply, parentId: parent.id }, parent, depth });
      walk(reply, depth + 1);
    }
    const remaining = parent.childrenCount - (parent.replies?.length ?? 0);
    if (remaining > 0) items.push({ kind: 'more', parent, remaining });
  };
  walk(root, 1);
  return items;
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
  depth = 0,
  replyTo,
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
  // Check if the current user is the author of the comment. A real id on both sides,
  // so a signed-out reader is never taken for the author of a profile-less comment.
  const viewerAuthorId = user?.authorProfile?.id;
  const isAuthor =
    viewerAuthorId != null && viewerAuthorId === comment?.createdBy?.authorProfile?.id;
  const flatReplies = useMemo(() => (depth === 0 ? flattenReplies(comment) : []), [depth, comment]);
  const canAwardBounty = canManageBounties(user);

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

  // Render the comment content based on whether it's being edited
  const renderContent = () => {
    // Check if this is a bounty comment
    const isBountyComment =
      comment.commentType === 'BOUNTY' ||
      (!!comment.bounties && Array.isArray(comment.bounties) && comment.bounties.length > 0);

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

    if (isBountyComment && comment.bounties?.length) {
      const bounty = comment.bounties[0];
      const showSolutions = !isOpenBounty(bounty) && (bounty.solutions?.length ?? 0) > 0;

      return (
        <CommentCard
          entry={transformCommentToFeedItem(comment, contentType, work)}
          depth={depth}
          replyTo={replyTo}
          isOwnComment={isAuthor}
          action={{
            label:
              bounty.bountyType === 'REVIEW' ? 'Opened a peer review bounty' : 'Opened a bounty',
          }}
          hideActions={readOnly || comment.isRemoved}
          showTooltips={showTooltips}
          workContentType={workContentType}
          afterBody={
            showSolutions && (
              <div className="mt-3">
                <BountySolutions
                  solutions={bounty.solutions}
                  isPeerReviewBounty={bounty.bountyType === 'REVIEW'}
                  totalAwardedAmount={calculateTotalAwardedAmount(bounty)}
                  onViewSolution={(solutionId, authorName, awardedAmount) =>
                    setSelectedSolution({ solutionId, authorName, awardedAmount })
                  }
                />
              </div>
            )
          }
          footer={
            !readOnly && (
              <PrimaryActionSection>
                <BountyActionRow
                  bounty={bounty}
                  commentId={comment.id}
                  relatedWork={work}
                  relatedDocumentId={comment.thread?.objectId}
                  relatedDocumentContentType={contentType}
                  canAward={isAuthor && canAwardBounty}
                  onAward={(bountyId) => {
                    setSelectedBountyId(bountyId);
                    setShowAwardModal(true);
                  }}
                  isAuthor={isAuthor}
                  onContributeSuccess={() => {
                    forceRefresh();
                    onCommentUpdate?.(comment);
                  }}
                  hideActions={comment.isRemoved}
                />
              </PrimaryActionSection>
            )
          }
        />
      );
    }

    return (
      <>
        <CommentCard
          entry={transformCommentToFeedItem(comment, contentType, work)}
          depth={depth}
          replyTo={replyTo}
          isOwnComment={isAuthor}
          onReply={readOnly ? undefined : () => setReplyingToCommentId(comment.id)}
          onEdit={readOnly || !isAuthor ? undefined : () => setEditingCommentId(comment.id)}
          onDelete={readOnly || !isAuthor ? undefined : () => handleDelete()}
          hideActions={readOnly || !includeReplies || comment.isRemoved}
          showTooltips={showTooltips}
          workContentType={workContentType}
        />

        {isReplying && !readOnly && (
          // Lined up with the row's words from the tablet up; the whole width on a phone.
          <div
            className={cn('mt-3', depth > 0 ? 'tablet:ml-11' : 'tablet:ml-[52px]')}
            data-testid="comment-reply-editor"
          >
            <CommentEditor
              onSubmit={handleReply}
              onCancel={() => setReplyingToCommentId(null)}
              placeholder="Write your reply..."
              autoFocus={true}
              isBountyReply={false}
            />
          </div>
        )}
      </>
    );
  };

  return (
    <div
      // A hairline under each whole thread, none between a thread's replies.
      className={depth === 0 ? cn(ACTIVITY_ROW_DIVIDER, 'py-4') : 'pt-4'}
      id={`comment-${comment.id}`}
      data-testid="comment-item"
    >
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

      {/* A thread lists every reply in one column, one indent in, with a rail running down
          from under the first comment's avatar. */}
      {includeReplies && flatReplies.length > 0 && (
        <>
          <div
            aria-hidden
            className="absolute bottom-6 left-[19px] top-16 w-0.5 rounded-full bg-gray-200"
          />
          <div className="pl-[52px]">
            {flatReplies.map((item) =>
              item.kind === 'reply' ? (
                <CommentItem
                  key={`reply-${item.reply.id}`}
                  comment={item.reply}
                  contentType={contentType}
                  commentType={commentType}
                  onCommentUpdate={onCommentUpdate}
                  onCommentDelete={onCommentDelete}
                  showTooltips={showTooltips}
                  includeReplies={includeReplies}
                  readOnly={readOnly}
                  depth={item.depth}
                  replyTo={item.depth >= 2 ? toCommentAuthor(item.parent.createdBy) : undefined}
                />
              ) : (
                <LoadMoreReplies
                  key={`more-${item.parent.id}`}
                  commentId={item.parent.id}
                  remainingCount={item.remaining}
                  isLoading={loading}
                />
              )
            )}
          </div>
        </>
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
