'use client';

import { FC, ReactNode, useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Flag,
  MessageCircle,
  MoreHorizontal,
  Pen,
  Star,
  ThumbsDown,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Icon } from '@/components/ui/icons/Icon';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { TipTooltip } from '@/components/tooltips/TipTooltip';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { isFoundationUser } from '@/components/Bounty/lib/bountyUtil';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { useVote } from '@/hooks/useVote';
import type { Comment } from '@/types/comment';
import type { UserVoteType } from '@/types/reaction';
import type { ContentType, Work } from '@/types/work';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgoShort } from '@/utils/date';
import { cn } from '@/utils/styles';

interface CommentRowProps {
  comment: Comment;
  /** Replies get a smaller avatar; the thread connector is drawn by the parent. */
  isReply: boolean;
  /** The work being discussed, used for the Author badge and vote bookkeeping. */
  work?: Work;
  contentType: ContentType;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hideActions?: boolean;
  workContentType?: ContentType;
  /** For a flattened reply to a reply: whose comment this one answers. */
  replyingTo?: string;
  /** Draw the thread line down from the avatar, joining this comment to its replies below. */
  showThreadLine?: boolean;
  /** Rendered under the row, inside its text column (e.g. the reply editor). */
  children?: ReactNode;
}

const ACTION_BUTTON =
  'flex h-8 items-center gap-1.5 rounded-md px-1.5 -mx-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-default';

/**
 * A comment, reply or peer review laid out like a professional-network thread:
 * avatar, name with headline under it, time and menu on the right, the words,
 * then icon-and-count actions (upvote, reply, tip) with awards on the far right.
 */
export const CommentRow: FC<CommentRowProps> = ({
  comment,
  isReply,
  work,
  contentType,
  onReply,
  onEdit,
  onDelete,
  hideActions = false,
  workContentType,
  replyingTo,
  showThreadLine = false,
  children,
}) => {
  const { user } = useUser();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { isOpen: isFlagOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [showLegacyCommentBanner, setShowLegacyCommentBanner] = useState(false);
  const [score, setScore] = useState(comment.score || 0);
  const [userVote, setUserVote] = useState<UserVoteType | undefined>(comment.userVote);

  const author = comment.createdBy?.authorProfile;
  const authorId = author?.id;
  const authorName = author?.fullName || comment.createdBy?.fullName || 'Unknown';
  const headline = author?.headline;
  const isVerified = Boolean(comment.createdBy?.isVerified || author?.isVerified);
  const isWorkAuthor = !!authorId && !!work?.authors?.some((a) => a.authorProfile.id === authorId);
  const isCurrentUserAuthor = !!user?.authorProfile?.id && user.authorProfile.id === authorId;
  const canTip = isFoundationUser(user?.id) && !isCurrentUserAuthor;
  const isRemoved = Boolean(comment.isRemoved);
  const isReview = comment.commentType === 'REVIEW';
  const reviewScore = comment.reviewScore || 0;
  const aiReviewUserId = process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
  const isAiReviewer =
    aiReviewUserId != null && String(comment.createdBy?.id ?? '') === String(aiReviewUserId);
  const isAssessedByFoundation = isReview && Boolean(comment.isAssessed) && !isAiReviewer;
  const tips = comment.tips ?? [];
  const totalAwarded =
    tips.reduce((total, tip) => total + (tip.amount || 0), 0) + (comment.awardedBountyAmount || 0);
  const relatedDocumentId = comment.thread?.objectId?.toString();

  const { vote, isVoting } = useVote({
    votableEntityId: comment.id,
    feedContentType: 'COMMENT',
    relatedDocumentId,
    relatedDocumentContentType: contentType,
    relatedDocumentTopics: work?.topics,
    onVoteError: () => {
      setScore(comment.score || 0);
      setUserVote(comment.userVote);
    },
  });

  /** Clicking the active vote again clears it; switching sides swings the score by two. */
  const handleVote = (direction: 'UPVOTE' | 'DOWNVOTE') => {
    if (isVoting) return;
    executeAuthenticatedAction(() => {
      const value = (vote?: UserVoteType) => (vote === 'UPVOTE' ? 1 : vote === 'DOWNVOTE' ? -1 : 0);
      const next: UserVoteType = userVote === direction ? 'NEUTRAL' : direction;
      setScore((prev) => prev + value(next) - value(userVote));
      setUserVote(next);
      vote(next);
    });
  };

  const handleReport = () => {
    executeAuthenticatedAction(() => {
      if (relatedDocumentId) {
        openFlagModal(relatedDocumentId, contentType, comment.id.toString());
      }
    });
  };

  const isLegacyComment = comment.contentFormat === 'QUILL_EDITOR';
  const canEdit = isCurrentUserAuthor && !!onEdit && !isRemoved;
  const canDelete = isCurrentUserAuthor && !!onDelete && !isRemoved;
  const canReport = !isCurrentUserAuthor && !!relatedDocumentId && !isRemoved;
  const showMenu = canEdit || canDelete || canReport;

  const createdDate = new Date(comment.createdDate);
  const avatarSize = isReply ? 32 : 40;

  return (
    <div className="flex gap-2" data-testid="comment-row">
      <div className="flex shrink-0 flex-col items-center">
        <Avatar src={author?.profileImage} alt={authorName} size={avatarSize} authorId={authorId} />
        {showThreadLine && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-gray-300" />}
      </div>

      <div className="min-w-0 flex-1">
        {/* Byline: name, badges and headline on the left; time and menu on the right. */}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
              {authorId ? (
                <AuthorTooltip authorId={authorId}>
                  <Link
                    href={`/author/${authorId}`}
                    className="text-sm font-semibold leading-5 text-gray-900 hover:text-primary-600 hover:underline"
                  >
                    {authorName}
                  </Link>
                </AuthorTooltip>
              ) : (
                <span className="text-sm font-semibold leading-5 text-gray-900">{authorName}</span>
              )}
              {isVerified && <VerifiedBadge size="sm" showTooltip />}
              {isWorkAuthor && (
                <span className="rounded bg-gray-600 px-1.5 py-px text-[11px] font-semibold leading-4 text-white">
                  Author
                </span>
              )}
              {isReview && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span aria-hidden="true">•</span>
                  Peer review
                  {reviewScore > 0 && !isRemoved && (
                    <span
                      className="ml-0.5 flex items-center gap-0.5 font-semibold text-gray-700"
                      aria-label={`Rated ${reviewScore} out of 5`}
                    >
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                      {reviewScore} / 5
                    </span>
                  )}
                </span>
              )}
            </div>
            {headline && <p className="truncate text-xs leading-4 text-gray-500">{headline}</p>}
            {replyingTo && (
              <p className="truncate text-xs leading-4 text-gray-500">
                Replying to <span className="font-medium text-gray-700">{replyingTo}</span>
              </p>
            )}
          </div>

          <Tooltip content={createdDate.toLocaleString()}>
            <time
              dateTime={comment.createdDate}
              className="shrink-0 cursor-default text-xs leading-5 text-gray-500"
            >
              {formatTimeAgoShort(comment.createdDate)}
            </time>
          </Tooltip>

          {showMenu && (
            <BaseMenu
              align="end"
              trigger={
                <button
                  type="button"
                  aria-label="More actions"
                  data-testid="feed-item-more-options"
                  className="-my-1.5 -mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              }
            >
              {canEdit && (
                <BaseMenuItem
                  onClick={() => (isLegacyComment ? setShowLegacyCommentBanner(true) : onEdit?.())}
                >
                  <div className="flex items-center gap-2">
                    <Pen className="h-4 w-4" />
                    <span>Edit</span>
                  </div>
                </BaseMenuItem>
              )}
              {canDelete && (
                <BaseMenuItem onClick={() => onDelete?.()}>
                  <div className="flex items-center gap-2 text-red-600">
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </div>
                </BaseMenuItem>
              )}
              {canReport && (
                <BaseMenuItem onClick={handleReport}>
                  <div className="flex items-center gap-2">
                    <Flag className="h-4 w-4" />
                    <span>Report</span>
                  </div>
                </BaseMenuItem>
              )}
            </BaseMenu>
          )}
        </div>

        {showLegacyCommentBanner && (
          <LegacyCommentBanner
            contentType={workContentType}
            onClose={() => setShowLegacyCommentBanner(false)}
          />
        )}

        <div className="mt-2">
          <CommentReadOnly
            content={comment.content}
            contentFormat={comment.contentFormat}
            createdDate={comment.createdDate}
            updatedDate={comment.updatedDate}
            className="text-[15px] leading-[22px] text-gray-900"
          />
        </div>

        {!hideActions && !isRemoved && (
          <div className="mt-1 flex items-center gap-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleVote('UPVOTE')}
                aria-pressed={userVote === 'UPVOTE'}
                aria-label={`Upvote, score ${score}`}
                className={cn(
                  ACTION_BUTTON,
                  userVote === 'UPVOTE' && 'font-medium text-primary-600 hover:text-primary-700'
                )}
              >
                <ThumbsUp
                  className={cn('h-5 w-5', userVote === 'UPVOTE' && 'fill-primary-100')}
                  strokeWidth={1.75}
                />
                {score !== 0 && <span>{score}</span>}
              </button>
              <button
                type="button"
                onClick={() => handleVote('DOWNVOTE')}
                aria-pressed={userVote === 'DOWNVOTE'}
                aria-label="Downvote"
                className={cn(
                  ACTION_BUTTON,
                  userVote === 'DOWNVOTE' && 'text-gray-900 hover:text-gray-900'
                )}
              >
                <ThumbsDown
                  className={cn('h-5 w-5', userVote === 'DOWNVOTE' && 'fill-gray-300')}
                  strokeWidth={1.75}
                />
              </button>
            </div>

            {onReply && (
              <button
                type="button"
                onClick={() => executeAuthenticatedAction(onReply)}
                data-testid="feed-item-comment-action"
                aria-label={
                  comment.childrenCount > 0
                    ? `Reply, ${comment.childrenCount} ${comment.childrenCount === 1 ? 'reply' : 'replies'} so far`
                    : 'Reply'
                }
                className={ACTION_BUTTON}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                {comment.childrenCount > 0 && <span>{comment.childrenCount}</span>}
              </button>
            )}

            {canTip && (
              <button
                type="button"
                onClick={() => setIsTipModalOpen(true)}
                aria-label="Tip"
                className={ACTION_BUTTON}
              >
                <Icon name="tipRSC" size={20} className="h-5 w-5" />
              </button>
            )}

            <div className="ml-auto flex items-center gap-3">
              {totalAwarded > 0 && (
                <Tooltip
                  content={
                    <TipTooltip
                      tips={tips}
                      awardedBountyAmount={comment.awardedBountyAmount}
                      totalAwarded={totalAwarded}
                      showUSD={showUSD}
                      exchangeRate={exchangeRate}
                    />
                  }
                  position="top"
                  width="w-[320px]"
                >
                  <span className="flex cursor-default items-center gap-1 text-xs font-medium text-amber-800">
                    <Icon name="tipRSC" size={16} className="h-4 w-4" />
                    {formatCurrency({ amount: totalAwarded, showUSD, exchangeRate, shorten: true })}
                  </span>
                </Tooltip>
              )}
              {isAssessedByFoundation && (
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
                  <span
                    className="flex cursor-default items-center gap-1 text-xs font-medium text-green-700"
                    aria-label="Awarded by the ResearchHub Foundation"
                  >
                    <CheckCircle className="h-4 w-4" aria-hidden="true" />
                    Awarded
                  </span>
                </Tooltip>
              )}
            </div>
          </div>
        )}

        {children}
      </div>

      <TipContentModal
        isOpen={isTipModalOpen}
        onClose={() => setIsTipModalOpen(false)}
        contentId={comment.id}
        feedContentType="COMMENT"
        recipientName={authorName}
      />

      {isFlagOpen && contentToFlag && (
        <FlagContentModal
          isOpen={isFlagOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}
    </div>
  );
};
