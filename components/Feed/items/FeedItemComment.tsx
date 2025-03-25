'use client';

import { FC } from 'react';
import React from 'react';
import { FeedEntry, FeedCommentContent } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions, ActionButton } from '@/components/Feed/FeedItemActions';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useRouter } from 'next/navigation';
import { cn } from '@/utils/styles';
import { ContentType } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { Reply, Pen, Trash2 } from 'lucide-react';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';

interface FeedItemCommentProps {
  entry: FeedEntry;
  href?: string; // Optional href prop
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showCreatorActions?: boolean;
  showRelatedWork?: boolean;
  showReadMoreCTA?: boolean; // New property for controlling the "Read more" button
  actionLabels?: {
    comment?: string;
    upvote?: string;
  };
  showTooltips?: boolean; // New property for controlling tooltips
}

/**
 * Component for rendering the body content of a comment feed item
 */
const FeedItemCommentBody: FC<{
  entry: FeedEntry;
  showRelatedWork?: boolean;
  showReadMoreCTA?: boolean;
}> = ({ entry, showRelatedWork = true, showReadMoreCTA = true }) => {
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;
  const isReview = comment.commentType === 'REVIEW';
  const reviewScore = comment.reviewScore || commentEntry.review?.score || comment.score || 0;

  // Get related work if available
  const relatedWork = entry.relatedWork;

  return (
    <div className="mb-4">
      {/* Review information for reviews (optional additional display) */}
      {isReview && (
        <div className="mb-4 text-gray-700 text-sm mt-0.5">
          <span className="font-medium">Review score: </span>
          <span className="text-yellow-500 font-medium">{reviewScore}/5</span>
        </div>
      )}

      {/* Comment Content */}
      <div className="text-gray-600">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          initiallyExpanded={false} // Always start with truncated content
          showReadMoreButton={showReadMoreCTA} // Only control the button visibility
        />
      </div>

      {/* Related Work - show if available */}
      {relatedWork && showRelatedWork && (
        <div className="mt-4" onClick={(e) => e.stopPropagation()}>
          <RelatedWorkCard size="sm" work={relatedWork} />
        </div>
      )}
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
  showRelatedWork = true,
  showReadMoreCTA = true, // Default to showing "Read more" button
  actionLabels,
  showTooltips = true, // Default to showing tooltips
}) => {
  console.log('&entry', entry);
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;
  const router = useRouter();

  // Get the author from the comment entry
  const author = commentEntry.createdBy;

  // Determine if this is a review comment
  const isReview = comment.commentType === 'REVIEW';

  // Get the review score from either comment.reviewScore, commentEntry.review.score, or comment.score
  const reviewScore = comment.reviewScore || commentEntry.review?.score || comment.score || 0;

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

  // Create menu items for edit and delete actions
  const menuItems = [];

  if (showCreatorActions) {
    if (onEdit) {
      menuItems.push({
        icon: Pen,
        label: 'Edit',
        onClick: (e?: React.MouseEvent) => {
          e?.stopPropagation();
          onEdit();
        },
      });
    }

    if (onDelete) {
      menuItems.push({
        icon: Trash2,
        label: 'Delete',
        onClick: (e?: React.MouseEvent) => {
          e?.stopPropagation();
          onDelete();
        },
      });
    }
  }

  // Determine if card should have clickable styles
  const isClickable = !!href;

  return (
    <div className="space-y-3">
      {/* Header */}
      <FeedItemHeader
        timestamp={commentEntry.createdDate}
        author={author}
        actionText={isReview ? `submitted a peer review` : 'Added a comment'}
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
          {/* Review Badge and Rating - Only show for reviews */}
          {isReview && (
            <div className="flex justify-between items-center mb-3">
              <ContentTypeBadge type="review" />
            </div>
          )}

          {/* Content area */}
          <div className="mb-4">
            {/* Body Content */}
            <FeedItemCommentBody
              entry={entry}
              showRelatedWork={showRelatedWork}
              showReadMoreCTA={showReadMoreCTA}
            />
          </div>

          {/* Action Buttons - Full width */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div onClick={(e) => e.stopPropagation()}>
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
                showTooltips={showTooltips}
                menuItems={menuItems}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
