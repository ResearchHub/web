'use client';

import { FC, useState } from 'react';
import React from 'react';
import { FeedEntry, FeedCommentContent, ParentCommentPreview } from '@/types/feed';
import { FeedItemHeader } from '@/components/Feed/FeedItemHeader';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ContentType } from '@/types/work';
import { Pen, Trash2 } from 'lucide-react';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { Avatar } from '@/components/ui/Avatar';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';
import { BaseFeedItem } from '@/components/Feed/BaseFeedItem';
import { Tooltip } from '@/components/ui/Tooltip';

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
  maxLength?: number;
}

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
  maxLength,
}) => {
  let [showLegacyCommentBanner, setShowLegacyCommentBanner] = useState(false);
  const commentEntry = entry.content as FeedCommentContent;
  const comment = commentEntry.comment;
  const parentComment = commentEntry.parentComment;
  const author = commentEntry.createdBy;
  const isReview = comment.commentType === 'REVIEW';
  const isLegacyComment = comment.contentFormat === 'QUILL_EDITOR';
  const reviewScore = comment.reviewScore || commentEntry.review?.score || comment.score || 0;
  const isRemoved = commentEntry.isRemoved;
  const relatedWork = entry.relatedWork;
  const commentPageUrl = href;

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

  return (
    <div className="space-y-3">
      <FeedItemHeader
        timestamp={commentEntry.createdDate}
        author={author}
        user={author.user}
        actionText={isReview ? `submitted a peer review` : 'added a comment'}
        work={entry.relatedWork}
        aiScore={(entry.content as any).comment.aiScore || -1}
      />
      {showLegacyCommentBanner && (
        <LegacyCommentBanner
          contentType={workContentType}
          onClose={() => setShowLegacyCommentBanner(false)}
        />
      )}
      <BaseFeedItem entry={entry} href={commentPageUrl} showHeader={false} showActions={false}>
        {isReview && (
          <div className="flex items-center gap-2 mb-3">
            <ContentTypeBadge type="review" />
          </div>
        )}

        {isReview && reviewScore > 0 && !isRemoved && (
          <div className="mb-4 text-gray-700 text-sm mt-0.5">
            <span className="font-medium">Review score: </span>
            <span className="text-yellow-500 font-medium">{reviewScore}/5</span>
          </div>
        )}

        <div className="text-gray-600 mb-4">
          <CommentReadOnly
            content={comment.content}
            contentFormat={comment.contentFormat}
            initiallyExpanded={false}
            showReadMoreButton={showReadMoreCTA}
            createdDate={commentEntry.createdDate}
            updatedDate={commentEntry.updatedDate}
            maxLength={maxLength}
          />
        </div>

        {parentComment && <RenderParentComment comment={parentComment} level={1} />}

        {relatedWork && showRelatedWork && (
          <div className="mt-4" onClick={(e) => e.stopPropagation()}>
            <RelatedWorkCard size="sm" work={relatedWork} />
          </div>
        )}

        {!hideActions && (
          <div className="pt-3 border-t border-gray-200">
            <div
              onClick={(e) => e.stopPropagation()}
              role="presentation"
              aria-hidden="true"
              tabIndex={-1}
            >
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
      </BaseFeedItem>
    </div>
  );
};
