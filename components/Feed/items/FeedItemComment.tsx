'use client';

import { FC, useState } from 'react';
import React from 'react';
import { FeedEntry, FeedCommentContent, ParentCommentPreview } from '@/types/feed';
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
import { Avatar } from '@/components/ui/Avatar';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';

// Define the recursive rendering component for parent comments
const RenderParentComment: FC<{ comment: ParentCommentPreview; level: number }> = ({
  comment,
  level,
}) => {
  // Base indentation + additional indentation per level
  const indentation = level * 0.25; // Adjust multiplier for desired nesting (using rem units)

  return (
    <div
      className="mt-4 p-3 pt-0 pb-0 border-l-2 border-l-gray-100  text-sm text-gray-500"
      style={{ marginLeft: `${indentation}rem` }}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Avatar
          src={comment.createdBy.profileImage}
          alt={comment.createdBy.fullName || 'User'}
          authorId={comment.createdBy.id}
          size="xs"
          disableTooltip
        />
        <span className="font-medium text-gray-700">{comment.createdBy.fullName}</span>
        <span>replied:</span>
      </div>
      <div className="text-gray-600">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          initiallyExpanded={false}
          showReadMoreButton={false}
        />
      </div>
      {/* Recursive call for the next parent level */}

      {level === 0 && comment.parentComment && (
        <RenderParentComment comment={comment.parentComment} level={level + 1} />
      )}
    </div>
  );
};

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
  hideActions?: boolean; // New property to hide action buttons completely
  workContentType?: ContentType;
}

/**
 * Component for rendering the body content of a comment feed item
 */
const FeedItemCommentBody: FC<{
  entry: FeedEntry;
  parentComment?: ParentCommentPreview;
  showRelatedWork?: boolean;
  showReadMoreCTA?: boolean;
}> = ({ entry, parentComment, showRelatedWork = true, showReadMoreCTA = true }) => {
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
      <div className="text-gray-600 mb-4">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          initiallyExpanded={false}
          showReadMoreButton={showReadMoreCTA}
        />
      </div>

      {/* Initiate recursive rendering of parent comments if they exist */}
      {parentComment && <RenderParentComment comment={parentComment} level={1} />}

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
  hideActions = false, // Default to not hiding actions
  workContentType,
}) => {
  let [showLegacyCommentBanner, setShowLegacyCommentBanner] = useState(false);
  // Extract the comment entry from the entry's content
  const commentEntry = entry.content as FeedCommentContent;

  const comment = commentEntry.comment;
  const router = useRouter();
  const parentComment = commentEntry.parentComment;

  // Get the author from the comment entry
  const author = commentEntry.createdBy;

  // Determine if this is a review comment
  const isReview = comment.commentType === 'REVIEW';

  const isLegacyComment = comment.contentFormat === 'QUILL_EDITOR';

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
          if (isLegacyComment) {
            setShowLegacyCommentBanner(true);
          } else {
            onEdit();
          }
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
        actionText={isReview ? `submitted a peer review` : 'added a comment'}
        work={entry.relatedWork}
      />
      {showLegacyCommentBanner && (
        <LegacyCommentBanner
          contentType={workContentType}
          onClose={() => setShowLegacyCommentBanner(false)}
        />
      )}
      {/* Main Content Card - Using onClick instead of wrapping with Link */}
      <div
        onClick={handleCardClick}
        className={cn(
          'bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden',
          isClickable &&
            'group hover:shadow-md hover:border-indigo-100 transition-all duration-200 cursor-pointer'
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
              parentComment={parentComment}
              showRelatedWork={showRelatedWork}
              showReadMoreCTA={showReadMoreCTA}
            />
          </div>

          {/* Action Buttons - Full width */}
          {!hideActions && (
            <div className="mt-4 pt-3 border-t border-gray-200">
              <div onClick={(e) => e.stopPropagation()}>
                {/* Standard Feed Item Actions with Reply functionality */}
                <FeedItemActions
                  metrics={entry.metrics}
                  feedContentType="COMMENT"
                  votableEntityId={comment.id}
                  relatedDocumentId={Number(commentEntry.relatedDocumentId)}
                  relatedDocumentContentType={commentEntry.relatedDocumentContentType}
                  userVote={entry.userVote}
                  actionLabels={actionLabels}
                  onComment={onReply}
                  showTooltips={showTooltips}
                  menuItems={menuItems}
                  awardedBountyAmount={entry.awardedBountyAmount}
                  tips={entry.tips}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
