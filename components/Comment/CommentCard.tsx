import { FC, useState } from 'react';
import { Comment } from '@/types/comment';
import { ContentType } from '@/types/work';
import { contentRenderers } from '@/components/Feed/registry';
import { CommentEditor } from './CommentEditor';
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
    // First render the footer actions from the renderer
    const footerActions = renderer.renderFooterActions(comment, {
      showActions,
      onUpvote,
      onReply,
      onEdit,
      onDelete,
      onReport,
      onShare,
      isAuthor,
    });

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
      <div className="mb-2">{renderer.renderHeader(comment, {})}</div>

      {/* Render the card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4">
          {/* Render the body */}
          {renderer.renderBody(comment, {
            isExpanded,
            onToggleExpand: () => setIsExpanded(!isExpanded),
          })}

          {/* Render content-specific actions */}
          {renderer.renderContentActions(comment, {
            isExpanded,
            onToggleExpand: () => setIsExpanded(!isExpanded),
          })}
        </div>
      </div>

      {/* Render footer actions with reply functionality */}
      {renderFooterActionsWithReply()}
    </div>
  );
};
