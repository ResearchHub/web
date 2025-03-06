'use client';

import { useState, useEffect } from 'react';
import { Comment, CommentType, UserVoteType } from '@/types/comment';
import { ContentType } from '@/types/work';
import { CommentService } from '@/services/comment.service';
import { CommentEditor } from './CommentEditor';
import { CommentItemHeader } from './CommentItemHeader';
import { CommentItemActions } from './CommentItemActions';
import { MessageCircle, ArrowUp, Flag, Edit2, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import 'highlight.js/styles/atom-one-dark.css';
import hljs from 'highlight.js';
import { CommentReadOnly } from './CommentReadOnly';
import { BountyItem } from '@/components/Bounty/BountyItem';
import { useSession } from 'next-auth/react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { toast } from 'react-hot-toast';
import { useComments } from '@/contexts/CommentContext';
import { parseContent } from './lib/commentContentUtils';
import TipTapRenderer from './lib/TipTapRenderer';
import LoadMoreReplies from './LoadMoreReplies';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { CommentContent } from './lib/types';
import { getDisplayBounty } from '@/components/Bounty/lib/bountyUtil';

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
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { data: session } = useSession();
  const {
    updateComment,
    deleteComment,
    voteComment,
    createReply,
    editingCommentId,
    replyingToCommentId,
    setEditingCommentId,
    setReplyingToCommentId,
    loading,
  } = useComments();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Log component lifecycle
  useEffect(() => {
    if (debug) {
      console.log(`CommentItem ${comment.id} - MOUNTED`);
    }
    return () => {
      if (debug) {
        console.log(`CommentItem ${comment.id} - UNMOUNTED`);
      }
    };
  }, [comment.id, debug]);

  // Add debug logging
  useEffect(() => {
    if (debug) {
      console.log(`CommentItem ${comment.id} - isReplying: ${replyingToCommentId === comment.id}`);
      console.log(`CommentItem ${comment.id} - isEditing: ${editingCommentId === comment.id}`);
    }
  }, [comment.id, replyingToCommentId, editingCommentId, debug]);

  if (debug) console.log('Rendering comment:', comment);

  // Check if there are any open bounties
  const hasOpenBounty =
    comment.bounties?.length > 0 &&
    comment.bounties.some((b) => b.status === 'OPEN' && !b.isContribution);

  // Check if the comment has been solved
  const isSolved =
    comment.bounties?.length > 0 &&
    comment.bounties.some((b) => b.status === 'CLOSED' && !b.isContribution);

  // Check if the current user is the author of the comment
  const isAuthor = session?.user?.id === comment.author?.id;

  // Check if the current user has voted on the comment
  const hasVoted = comment.userVote !== 'NEUTRAL';

  // Determine if this comment is being edited or replied to
  const isEditing = editingCommentId === comment.id;
  const isReplying = replyingToCommentId === comment.id;

  if (debug) {
    console.log(`CommentItem ${comment.id} - isEditing: ${isEditing}, isReplying: ${isReplying}`);
    console.log(`CommentItem ${comment.id} - parentId: ${comment.parentId}`);
    if (comment.replies) {
      console.log(`CommentItem ${comment.id} - replies: ${comment.replies.length}`);
    }
  }
  console.log('comment', comment);
  // Handle voting on a comment
  const handleVote = async (voteType: UserVoteType) => {
    try {
      // Make the API call through the context
      await voteComment(comment, voteType);

      // The context handles optimistic updates, so we don't need to update the comment here
    } catch (error) {
      console.error('Error voting on comment:', error);
      toast.error('Failed to vote on comment');
    }
  };

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

  // Render the comment content based on whether it's being edited
  const renderContent = () => {
    if (debug) {
      console.log(`renderContent for comment ${comment.id}:`);
      console.log(`- isEditing: ${isEditing}`);
      console.log(`- isReplying: ${isReplying}`);
    }

    // If editing, show the editor
    if (isEditing) {
      // Extract the actual content from the comment to avoid nested content structures
      // This fixes the "Invalid input for Fragment.fromJSON" error
      const editorContent =
        comment.content?.content &&
        typeof comment.content.content === 'object' &&
        comment.content.content.type === 'doc'
          ? comment.content.content
          : comment.content;

      // Parse the content to ensure we're passing the correct format to the editor
      const parsedContent = parseContent(editorContent, comment.contentFormat, debug);

      if (debug) {
        console.log('Comment content for editor:', comment.content);
        console.log('Extracted editor content:', editorContent);
        console.log('Parsed content for editor:', parsedContent);
      }

      return (
        <div className="border border-gray-200 rounded-lg p-4">
          <CommentEditor
            initialContent={parsedContent}
            onSubmit={handleEdit}
            onCancel={() => setEditingCommentId(null)}
            placeholder="Edit your comment..."
            debug={debug}
          />
        </div>
      );
    }

    // For bounty comments, render the bounty component
    if (comment.bounties && comment.bounties.length > 0) {
      if (debug) {
        console.log(`Comment ${comment.id} has bounties:`, comment.bounties);
      }

      // Use the getDisplayBounty utility function to find the display bounty
      const displayBounty = getDisplayBounty(comment.bounties);

      if (debug) {
        console.log(`Display bounty for comment ${comment.id}:`, displayBounty);
      }

      if (displayBounty) {
        return (
          <div className="border border-gray-200 rounded-lg p-4">
            <BountyItem
              comment={comment}
              contentType={contentType}
              onSubmitSolution={() => setReplyingToCommentId(comment.id)}
              isCreator={session?.user?.id === displayBounty?.createdBy?.id}
              onBountyUpdated={() => onCommentUpdate && onCommentUpdate(comment)}
            />

            {/* Show reply editor below the bounty content if replying */}
            {isReplying && (
              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm font-medium mb-2">Your reply:</h4>
                <CommentEditor
                  onSubmit={handleReply}
                  onCancel={() => setReplyingToCommentId(null)}
                  placeholder="Write your solution..."
                  autoFocus={true}
                />
              </div>
            )}
          </div>
        );
      }
    }

    // For regular comments, render the content and optionally the reply editor
    return (
      <>
        <CommentItemHeader
          profileImage={comment.author?.profileImage}
          fullName={comment.author?.fullName || 'Unknown User'}
          profileUrl={comment.author?.profileUrl || '#'}
          date={comment.createdDate}
          commentType={comment.commentType}
          score={comment.score}
          className="mb-3"
        />
        <div className="border border-gray-200 rounded-lg p-4">
          <CommentReadOnly
            content={comment.content}
            contentFormat={comment.contentFormat}
            contentType={contentType}
            debug={debug}
          />

          {/* Show reply editor below the comment content if replying */}
          {isReplying && (
            <div className="mt-4 border-t pt-4">
              <h4 className="text-sm font-medium mb-2">Your reply:</h4>
              <CommentEditor
                onSubmit={handleReply}
                onCancel={() => setReplyingToCommentId(null)}
                placeholder="Write your reply..."
                autoFocus={true}
              />
            </div>
          )}
        </div>
      </>
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

      {/* Comment actions (reply, edit, delete, etc.) */}
      {renderCommentActions && !isEditing && !isReplying && (
        <CommentItemActions
          score={comment.score}
          replyCount={comment.replyCount || 0}
          commentId={comment.id}
          documentId={Number(comment.thread.objectId)}
          userVote={comment.userVote}
          onReply={() => {
            if (debug) console.log(`Setting replyingToCommentId to ${comment.id}`);
            setReplyingToCommentId(comment.id);
          }}
          onEdit={() => {
            if (debug) console.log(`Setting editingCommentId to ${comment.id}`);
            setEditingCommentId(comment.id);
          }}
          onDelete={handleDelete}
          onVote={handleVote}
          className="mt-3"
          isAuthor={isAuthor}
        />
      )}

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
    </div>
  );
};
