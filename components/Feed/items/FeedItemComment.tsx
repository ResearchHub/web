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
import { Reply, Edit, Trash2 } from 'lucide-react';

interface FeedItemCommentProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
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
  showActions = true,
}) => {
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;
  const router = useRouter();

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
          <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
            <div className="flex gap-2 items-center w-full" onClick={(e) => e.stopPropagation()}>
              {/* Standard Feed Item Actions */}
              <FeedItemActions
                metrics={entry.metrics}
                feedContentType="COMMENT"
                votableEntityId={comment.id}
                relatedDocumentId={comment.thread?.objectId}
                relatedDocumentContentType={contentType}
                userVote={entry.userVote}
                onComment={onReply}
              />

              {/* Additional action buttons if showActions is true */}
              {showActions && (
                <div className="ml-auto flex gap-2">
                  {onEdit && (
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

                  {onDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
