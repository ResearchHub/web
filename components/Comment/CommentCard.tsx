import { FC, useState } from 'react';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { contentRenderers } from '@/components/Feed/registry';
import { CommentEditor } from './CommentEditor';
import { ArrowUp, MessageCircle, Flag, Share, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSession } from 'next-auth/react';

interface CommentCardProps {
  comment: Comment;
  contentType: ContentType;
  isReplying?: boolean;
  onCancelReply?: () => void;
  onSubmitReply?: (params: any) => Promise<boolean>;
  onUpvote?: (commentId: number) => void;
  onReply?: (commentId: number) => void;
  onReport?: (commentId: number) => void;
  onShare?: (commentId: number) => void;
  onEdit?: (commentId: number) => void;
  onDelete?: (commentId: number) => void;
  showActions?: boolean;
  debug?: boolean;
}

/**
 * CommentCard is a component that renders a regular comment using the registry pattern.
 * This component should only be used for regular comments, not bounty comments.
 */
export const CommentCard: FC<CommentCardProps> = ({
  comment,
  contentType,
  isReplying = false,
  onCancelReply,
  onSubmitReply,
  onUpvote,
  onReply,
  onReport,
  onShare,
  onEdit,
  onDelete,
  showActions = true,
  debug = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();

  // Check if the current user is the author of the comment
  const isAuthor = session?.user?.id === comment.author?.id;

  // Use the registry pattern to render the comment
  const renderer =
    contentRenderers[comment.commentType?.toLowerCase() || 'comment'] ||
    contentRenderers.comment ||
    contentRenderers.default;

  // Custom actions handler that includes reply functionality
  const renderFooterActionsWithReply = () => {
    // Create a custom renderer that uses our callbacks
    const customRenderer = {
      ...renderer,
      renderFooterActions: (commentData: Comment, options: { showActions?: boolean } = {}) => {
        const { showActions = true } = options;

        if (!showActions) return null;

        const isBountyComment =
          commentData.commentType === 'BOUNTY' ||
          (commentData.bounties && commentData.bounties.length > 0);

        // We now handle both regular and bounty comments here
        return (
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => onUpvote && onUpvote(commentData.id)}
              >
                <ArrowUp className="h-4 w-4" />
                <span>Upvote</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-1.5"
                onClick={() => onReply && onReply(commentData.id)}
              >
                <MessageCircle className="h-4 w-4" />
                <span>Reply</span>
              </Button>

              {isAuthor && onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5"
                  onClick={() => onEdit(commentData.id)}
                >
                  <Edit2 className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {isAuthor && onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-500"
                  onClick={() => onDelete(commentData.id)}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              )}

              {isBountyComment ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-500"
                  onClick={() => onShare && onShare(commentData.id)}
                >
                  <Share className="h-4 w-4" />
                  <span className="sr-only">Share</span>
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-1.5 text-gray-500"
                  onClick={() => onReport && onReport(commentData.id)}
                >
                  <Flag className="h-4 w-4" />
                  <span className="sr-only">Report</span>
                </Button>
              )}
            </div>
          </div>
        );
      },
    };

    // First render the footer actions from the custom renderer
    const footerActions = customRenderer.renderFooterActions(comment, { showActions });

    // If we're in reply mode, add the reply editor
    if (isReplying && onSubmitReply) {
      return (
        <div>
          {footerActions}
          <div className="mt-4 border-t pt-4 px-4 pb-4">
            <h4 className="text-sm font-medium mb-2">Your reply:</h4>
            <CommentEditor
              onSubmit={onSubmitReply}
              onCancel={onCancelReply}
              placeholder="Write your reply..."
              autoFocus={true}
            />
          </div>
        </div>
      );
    }

    return footerActions;
  };

  return (
    <div className="space-y-4">
      {/* Render the header */}
      {renderer.renderHeader(comment)}

      <div className="mt-2">
        {/* Render the body */}
        {renderer.renderBody(comment, {
          isExpanded,
          onToggleExpand: () => setIsExpanded(!isExpanded),
        })}

        {/* Render content actions */}
        {renderer.renderContentActions(comment, {
          isExpanded,
          onToggleExpand: () => setIsExpanded(!isExpanded),
        })}

        {/* Render the footer actions with reply functionality */}
        {showActions && <div className="mt-2">{renderFooterActionsWithReply()}</div>}
      </div>
    </div>
  );
};
