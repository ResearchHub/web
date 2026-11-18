'use client';

import { FC, useState } from 'react';
import { CheckCircle, Pen, Trash2 } from 'lucide-react';
import { ActivityActor } from '@/components/Activity/cards/ActivityActor';
import { ACTIVITY_CONTENT_DIVIDER } from '@/components/Activity/cards/ActivityCardShell';
import {
  getActivityActionLine,
  getActivityComment,
  toReviewVerdictPreview,
} from '@/components/Activity/lib/activityDisplay.utils';
import {
  getActivityWork,
  shouldShowAuthorBadge,
} from '@/components/Activity/lib/activityWork.utils';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { shouldShowCommentButton } from '@/components/Feed/lib/feedUtils';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';
import { ActivityCommentPanel } from '@/components/modals/ActivityCommentPanel';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import type { FeedCommentContent, FeedEntry } from '@/types/feed';
import type { ContentType } from '@/types/work';

interface CommentRowProps {
  entry: FeedEntry;
  isReply: boolean;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** The signed-in user wrote the comment: they can edit and delete it, but not tip it. */
  isCurrentUserAuthor: boolean;
  showTooltips: boolean;
  hideActions: boolean;
  workContentType?: ContentType;
}

/**
 * A comment, reply or peer review in a work's comment section, laid out as an
 * activity row: the byline beside the avatar, the words under it, then votes,
 * reply and tip. A review previews its verdict and opens in full in the side panel.
 */
export const CommentRow: FC<CommentRowProps> = ({
  entry,
  isReply,
  onReply,
  onEdit,
  onDelete,
  isCurrentUserAuthor,
  showTooltips,
  hideActions,
  workContentType,
}) => {
  const [showLegacyCommentBanner, setShowLegacyCommentBanner] = useState(false);
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [isReviewPanelOpen, setIsReviewPanelOpen] = useState(false);
  const commentEntry = entry.content as FeedCommentContent;
  const { comment, createdBy: author } = commentEntry;
  const work = getActivityWork(entry);
  const review = comment.commentType === 'REVIEW' && work ? getActivityComment(entry) : null;
  const aiReviewUserId = process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
  const isAiReviewer =
    aiReviewUserId != null && String(author.user?.id ?? '') === String(aiReviewUserId);
  const isAssessedByFoundation =
    comment.commentType === 'REVIEW' && Boolean(entry.isAssessed) && !isAiReviewer;
  const openReviewPanel = () => setIsReviewPanelOpen(true);

  const menuItems = [];
  if (isCurrentUserAuthor && onEdit) {
    menuItems.push({
      icon: Pen,
      label: 'Edit',
      onClick: () =>
        comment.contentFormat === 'QUILL_EDITOR' ? setShowLegacyCommentBanner(true) : onEdit(),
    });
  }
  if (isCurrentUserAuthor && onDelete) {
    menuItems.push({ icon: Trash2, label: 'Delete', onClick: onDelete });
  }

  return (
    <>
      {showLegacyCommentBanner && (
        <LegacyCommentBanner
          contentType={workContentType}
          onClose={() => setShowLegacyCommentBanner(false)}
        />
      )}

      <ActivityActor
        authors={[author]}
        action={isReply ? { label: 'Replied' } : getActivityActionLine(entry, work ?? undefined)}
        timestamp={commentEntry.createdDate}
        isAuthor={shouldShowAuthorBadge(entry, author.id)}
        menu={
          isAssessedByFoundation && (
            <Tooltip
              content={
                <div className="flex items-start gap-3 text-left">
                  <CheckCircle className="h-10 w-10 text-green-600" />
                  <div>Reviewed and approved by the ResearchHub Foundation Editor Team.</div>
                </div>
              }
              position="top"
              width="w-[320px]"
            >
              <Badge variant="success" className="cursor-pointer gap-1.5 border-green-600 py-1">
                <CheckCircle className="h-4 w-4" />
                Awarded
              </Badge>
            </Tooltip>
          )
        }
      >
        <div className={isReply ? 'mt-2' : ACTIVITY_CONTENT_DIVIDER}>
          {review ? (
            <CommentReadOnly
              content={toReviewVerdictPreview(review.content)}
              contentFormat={review.format}
              maxLength={250}
              showLinkPreviews={false}
              onReadMore={openReviewPanel}
              className="feed-comment-preview text-[15px] leading-6 text-gray-900"
            />
          ) : (
            <CommentReadOnly
              content={comment.content}
              contentFormat={comment.contentFormat}
              createdDate={commentEntry.createdDate}
              updatedDate={commentEntry.updatedDate}
              className="text-[15px] leading-6 text-gray-900"
            />
          )}
        </div>

        {!hideActions && (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-3">
            <FeedItemActions
              metrics={entry.metrics}
              feedContentType="COMMENT"
              votableEntityId={comment.id}
              relatedDocumentId={commentEntry.relatedDocumentId?.toString()}
              relatedDocumentUnifiedDocumentId={entry.relatedWork?.unifiedDocumentId?.toString()}
              relatedDocumentContentType={commentEntry.relatedDocumentContentType}
              userVote={entry.userVote}
              actionLabels={{ comment: 'Reply' }}
              onComment={onReply}
              onTip={isCurrentUserAuthor ? undefined : () => setIsTipModalOpen(true)}
              showTooltips={showTooltips}
              menuItems={menuItems}
              awardedBountyAmount={entry.awardedBountyAmount}
              tips={entry.tips}
              relatedDocumentTopics={entry.relatedWork?.topics}
              hideCommentButton={!shouldShowCommentButton(entry.metrics, Boolean(onReply))}
              variant="card"
              groupUtilityActions
              className="-ml-1.5 gap-2"
            />
            {review && (
              <Button variant="outlined" size="sm" className="ml-auto" onClick={openReviewPanel}>
                Read review
              </Button>
            )}
          </div>
        )}
      </ActivityActor>

      <TipContentModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        contentId={comment.id}
        feedContentType="COMMENT"
        recipientName={author.fullName}
      />

      {review && work && (
        <ActivityCommentPanel
          isOpen={isReviewPanelOpen}
          onClose={() => setIsReviewPanelOpen(false)}
          comment={review}
          work={work}
        />
      )}
    </>
  );
};
