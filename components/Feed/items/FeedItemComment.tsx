'use client';

import { FC } from 'react';
import { FeedEntry, FeedCommentContent } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { Reply, Edit, Trash2, Flag } from 'lucide-react';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface FeedItemCommentProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showCreatorActions?: boolean;
  actionLabels?: {
    comment?: string;
    upvote?: string;
  };
}

/**
 * Component for rendering the body content of a comment feed item
 */
const FeedItemCommentBody: FC<{
  entry: FeedEntry;
}> = ({ entry }) => {
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;

  return (
    <div className="mb-4">
      {/* Comment Content */}
      <div className="text-gray-600">
        <CommentReadOnly content={comment.content} contentFormat={comment.contentFormat} />
      </div>
    </div>
  );
};

/**
 * Main component for rendering a comment feed item
 */
export const FeedItemComment: FC<FeedItemCommentProps> = ({
  entry,
  href,
  onReply,
  onEdit,
  onDelete,
  showCreatorActions = true,
  actionLabels,
}) => {
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  // Get the author from the comment entry
  const author = commentEntry.createdBy;

  // Determine the content type for the comment
  const contentType: ContentType = comment.thread?.threadType === 'PAPER' ? 'paper' : 'post';

  // Use provided href or create default comment page URL
  const commentPageUrl = href || `/comment/${comment.thread?.objectId}/${comment.id}`;

  // Handle click on the card (navigate to comment page) - only if href is provided
  const handleCardClick = () => {
    if (href) {
      router.push(commentPageUrl);
    }
  };

  // Handle report button click
  const handleReport = () => {
    executeAuthenticatedAction(() => {
      openFlagModal(comment.thread?.objectId?.toString() || '', contentType, comment.id.toString());
    });
  };

  // Determine if card should have clickable styles
  const isClickable = !!href;
  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={commentEntry.createdDate}
        author={author}
        actionText="Added a comment"
      />

      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:border-blue-200 transition-all duration-200 cursor-pointer'
        )}
      >
        <div className="p-4">
          {/* Content area */}
          <div className="mb-4">
            {/* Body Content */}
            <FeedItemCommentBody entry={entry} />
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div
              className="flex items-center w-full justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2">
                {/* Standard Feed Item Actions with Reply functionality */}
                <FeedItemActions
                  metrics={entry.metrics}
                  feedContentType="COMMENT"
                  votableEntityId={comment.id}
                  relatedDocumentId={comment.thread?.objectId}
                  relatedDocumentContentType={contentType}
                  userVote={entry.userVote}
                  actionLabels={actionLabels}
                  onComment={onReply}
                />

                {/* Edit button - show to the right of comment button */}
                {showCreatorActions && onEdit && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Delete button - show to the left of Report button with no text */}
                {showCreatorActions && onDelete && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sr-only">Delete</span>
                  </Button>
                )}

                {/* Report button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReport();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Flag className="w-4 h-4" />
                  <span className="sr-only">Report</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Flag Content Modal */}
      {contentToFlag && (
        <FlagContentModal
          isOpen={isOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}
    </div>
  );
};
