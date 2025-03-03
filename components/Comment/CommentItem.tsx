'use client';

import { useState } from 'react';
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
import { commentEvents } from '@/hooks/useComments';
import { useComments } from '@/contexts/CommentContext';
import { parseContent } from './lib/commentContentUtils';
import TipTapRenderer from './lib/TipTapRenderer';

interface CommentItemProps {
  comment: Comment;
  contentType: ContentType;
  commentType?: CommentType;
  onCommentUpdate: (newComment: Comment, parentId?: number) => void;
  onCommentDelete: (commentId: number) => void;
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
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const { data: session } = useSession();
  const { updateComment, deleteComment, voteComment } = useComments();

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
  const handleEdit = async (content: any) => {
    try {
      setUpdateError(null);

      if (debug) {
        console.log('Original content for edit:', content);
      }

      // Ensure we're passing the correct content format for TipTap
      let formattedContent = content;

      // For TipTap content, ensure it has the proper structure
      if (comment.contentFormat === 'TIPTAP' && content) {
        // If it's not already a valid TipTap document, create one
        if (!content.type || content.type !== 'doc') {
          formattedContent = {
            type: 'doc',
            content: Array.isArray(content) ? content : [content],
          };
        } else if (content.type === 'doc' && !Array.isArray(content.content)) {
          // Fix invalid content structure
          formattedContent = {
            type: 'doc',
            content: [],
          };
        }

        if (debug) {
          console.log('Formatted content for edit:', formattedContent);
        }
      }

      const updatedComment = await updateComment(comment.id, formattedContent);
      if (updatedComment) {
        onCommentUpdate(updatedComment);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating comment:', error);
      setUpdateError('Failed to update comment');
    }
  };

  // Handle deleting a comment
  const handleDelete = async () => {
    try {
      await deleteComment(comment.id);
      onCommentDelete(comment.id);
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  // Handle submitting a reply
  const handleReply = async (content: any) => {
    try {
      setUpdateError(null);
      const newComment = await CommentService.createComment({
        workId: comment.thread.objectId,
        content,
        contentType,
        commentType,
        parentId: comment.id,
        threadType: commentType,
      });

      // Emit the comment created event
      commentEvents.emit('comment_created' as any, {
        comment: newComment,
        contentType,
        documentId: comment.thread.objectId,
      });

      // Update the parent comment with the new reply
      onCommentUpdate(newComment, comment.id);
      setIsReplying(false);
    } catch (error) {
      console.error('Error creating reply:', error);
      setUpdateError('Failed to create reply');
    }
  };

  // Render the comment content based on whether it's being edited
  const renderContent = () => {
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
            onCancel={() => setIsEditing(false)}
            placeholder="Edit your comment..."
            debug={debug}
          />
        </div>
      );
    }

    // For bounty comments, render the bounty component
    if (commentType === 'BOUNTY' && comment.bounties && comment.bounties.length > 0) {
      // If the user is replying, show the editor
      if (isReplying) {
        return (
          <div className="mt-4 border border-gray-200 rounded-lg p-4">
            <CommentEditor
              onSubmit={handleReply}
              onCancel={() => setIsReplying(false)}
              placeholder="Write your solution..."
            />
          </div>
        );
      }

      // Find the active bounty to check creator
      const activeBounty = comment.bounties.find((b) => b.status === 'OPEN' && !b.isContribution);
      const closedBounty = comment.bounties.find((b) => b.status === 'CLOSED' && !b.isContribution);
      const displayBounty = activeBounty || closedBounty;

      if (displayBounty) {
        return (
          <div className="border border-gray-200 rounded-lg p-4">
            <BountyItem
              comment={comment}
              contentType={contentType}
              onSubmitSolution={() => setIsReplying(true)}
              isCreator={session?.user?.id === displayBounty?.createdBy?.id}
              onBountyUpdated={() => onCommentUpdate(comment)}
            />
            <div className="mt-4">
              <CommentReadOnly
                content={comment.content}
                contentFormat={comment.contentFormat}
                debug={debug}
              />
            </div>
          </div>
        );
      }
    }

    // If the user is replying, show the editor
    if (isReplying) {
      return (
        <div className="mt-4 border border-gray-200 rounded-lg p-4">
          <CommentEditor
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            placeholder="Write your reply..."
          />
        </div>
      );
    }

    // For regular comments, render the content
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          contentType={contentType}
          debug={debug}
        />
      </div>
    );
  };

  return (
    <div className="py-4 mb-2">
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
        </div>
      )}

      {/* Comment header with author info and timestamp */}
      <CommentItemHeader
        profileImage={comment.author?.profileImage}
        fullName={comment.author?.fullName || 'Unknown User'}
        profileUrl={comment.author?.profileUrl || '#'}
        date={comment.createdDate}
        commentType={commentType}
        score={comment.score}
        className="mb-3"
      />

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
          onReply={() => setIsReplying(true)}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
          onVote={handleVote}
          className="mt-3"
        />
      )}

      {/* Reply editor */}
      {isReplying && !isEditing && (
        <div className="mt-4">
          <CommentEditor
            onSubmit={handleReply}
            onCancel={() => setIsReplying(false)}
            placeholder="Write your reply..."
          />
        </div>
      )}

      {/* Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-8 mt-4 border-l-2 border-gray-200 pl-4">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              contentType={contentType}
              commentType={commentType}
              onCommentUpdate={onCommentUpdate}
              onCommentDelete={onCommentDelete}
              debug={debug}
            />
          ))}
        </div>
      )}
    </div>
  );
};
