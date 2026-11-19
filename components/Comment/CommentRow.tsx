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
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
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
import { UserVoteType } from '@/types/reaction';
import type { ContentType, Work } from '@/types/work';
import { formatCurrency } from '@/utils/currency';
import { formatTimeAgoShort } from '@/utils/date';
import { cn } from '@/utils/styles';

interface CommentRowProps {
  comment: Comment;
  /** Replies get a smaller avatar; the thread connector is drawn by the parent. */
  isReply: boolean;
  /** The signed-in user wrote the comment: they can edit and delete it, not tip or report it. */
  isCurrentUserAuthor: boolean;
  /** The work being discussed, used for the Author badge and vote bookkeeping. */
  work?: Work;
  contentType: ContentType;
  onReply?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  /** Hides the action row and the ⋯ menu. */
  hideActions?: boolean;
  workContentType?: ContentType;
  /** Draw the thread line down from the avatar, joining this comment to its replies below. */
  showThreadLine?: boolean;
  /** Rendered under the row, inside its text column (the reply editor). */
  children?: ReactNode;
}

const ACTION_BUTTON = '-mx-1.5 gap-1.5 rounded-md px-1.5 text-sm font-normal hover:text-gray-900';

const VOTE_SCORES: Record<UserVoteType, number> = { UPVOTE: 1, NEUTRAL: 0, DOWNVOTE: -1 };

/**
 * A comment, reply or peer review laid out like a professional-network thread:
 * avatar, name with headline under it, time and menu on the right, the words,
 * then icon-and-count actions (votes, reply, tip) with tips on the far right.
 */
export const CommentRow: FC<CommentRowProps> = ({
  comment,
  isReply,
  isCurrentUserAuthor,
  work,
  contentType,
  onReply,
  onEdit,
  onDelete,
  hideActions = false,
  workContentType,
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
  const [score, setScore] = useState(comment.score);
  const [userVote, setUserVote] = useState<UserVoteType | undefined>(comment.userVote);

  const { createdBy } = comment;
  const author = createdBy.authorProfile;
  const authorId = author?.id;
  const isWorkAuthor = !!work?.authors?.some((a) => a.authorProfile.id === authorId);
  const isVerified = createdBy.isVerified || author?.isVerified;
  const isReview = comment.commentType === 'REVIEW';
  const canTip = isFoundationUser(user?.id) && !isCurrentUserAuthor;
  const isAssessedByFoundation =
    isReview &&
    comment.isAssessed &&
    String(createdBy.id) !== process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
  const tips = comment.tips ?? [];
  const totalAwarded =
    tips.reduce((total, tip) => total + tip.amount, 0) + (comment.awardedBountyAmount ?? 0);
  const relatedDocumentId = comment.thread?.objectId?.toString();

  const { vote, isVoting } = useVote({
    votableEntityId: comment.id,
    feedContentType: 'COMMENT',
    relatedDocumentId,
    relatedDocumentContentType: contentType,
    relatedDocumentTopics: work?.topics,
    onVoteError: () => {
      setScore(comment.score);
      setUserVote(comment.userVote);
    },
  });

  const handleVote = (direction: UserVoteType) => {
    if (isVoting) return;
    executeAuthenticatedAction(() => {
      const nextVote: UserVoteType = userVote === direction ? 'NEUTRAL' : direction;
      setScore((prev) => prev + VOTE_SCORES[nextVote] - VOTE_SCORES[userVote ?? 'NEUTRAL']);
      setUserVote(nextVote);
      vote(nextVote);
    });
  };

  const handleReport = () => {
    executeAuthenticatedAction(() => {
      if (relatedDocumentId) {
        openFlagModal(relatedDocumentId, contentType, comment.id.toString());
      }
    });
  };

  const canEdit = isCurrentUserAuthor && !!onEdit;
  const canDelete = isCurrentUserAuthor && !!onDelete;
  const canReport = !isCurrentUserAuthor && !!relatedDocumentId;
  const showMenu = !hideActions && (canEdit || canDelete || canReport);

  return (
    <div className="flex gap-2" data-testid="comment-row">
      <div className="flex shrink-0 flex-col items-center">
        <Avatar
          src={author?.profileImage}
          alt={createdBy.fullName}
          size={isReply ? 32 : 40}
          authorId={authorId}
        />
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
                    {createdBy.fullName}
                  </Link>
                </AuthorTooltip>
              ) : (
                <span className="text-sm font-semibold leading-5 text-gray-900">
                  {createdBy.fullName}
                </span>
              )}
              {isVerified && <VerifiedBadge size="sm" showTooltip />}
              {isWorkAuthor && <AuthorBadge size="sm" />}
              {isReview && (
                <span className="flex items-center gap-1 text-xs text-gray-500">
                  <span aria-hidden="true">•</span>
                  Peer review
                  {comment.reviewScore > 0 && !comment.isRemoved && (
                    <span className="ml-0.5 flex items-center gap-0.5 font-semibold text-gray-700">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" aria-hidden="true" />
                      {comment.reviewScore} / 5
                    </span>
                  )}
                </span>
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
                  <Badge variant="success" className="cursor-pointer gap-1.5 border-green-600 py-1">
                    <CheckCircle className="h-4 w-4" />
                    Awarded
                  </Badge>
                </Tooltip>
              )}
            </div>
            {author?.headline && (
              <p className="truncate text-xs leading-4 text-gray-500">{author.headline}</p>
            )}
          </div>

          <Tooltip content={new Date(comment.createdDate).toLocaleString()}>
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
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="More actions"
                  data-testid="feed-item-more-options"
                  className="-my-1.5 -mr-1.5 h-8 w-8 rounded-full text-gray-600 hover:text-gray-900"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              }
            >
              {canEdit && (
                <BaseMenuItem
                  onClick={() =>
                    comment.contentFormat === 'QUILL_EDITOR'
                      ? setShowLegacyCommentBanner(true)
                      : onEdit?.()
                  }
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

        {!hideActions && (
          <div className="mt-1 flex items-center gap-5">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('UPVOTE')}
                aria-pressed={userVote === 'UPVOTE'}
                aria-label="Upvote"
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
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleVote('DOWNVOTE')}
                aria-pressed={userVote === 'DOWNVOTE'}
                aria-label="Downvote"
                className={cn(ACTION_BUTTON, userVote === 'DOWNVOTE' && 'text-gray-900')}
              >
                <ThumbsDown
                  className={cn('h-5 w-5', userVote === 'DOWNVOTE' && 'fill-gray-300')}
                  strokeWidth={1.75}
                />
              </Button>
            </div>

            {onReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => executeAuthenticatedAction(onReply)}
                data-testid="feed-item-comment-action"
                aria-label="Reply"
                className={ACTION_BUTTON}
              >
                <MessageCircle className="h-5 w-5" strokeWidth={1.75} />
                {comment.childrenCount > 0 && <span>{comment.childrenCount}</span>}
              </Button>
            )}

            {canTip && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsTipModalOpen(true)}
                aria-label="Tip"
                className={ACTION_BUTTON}
              >
                <Icon name="tipRSC" size={20} className="h-5 w-5" />
              </Button>
            )}

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
                wrapperClassName="ml-auto"
              >
                <span className="flex cursor-default items-center gap-1 text-xs font-medium text-amber-800">
                  <Icon name="tipRSC" size={16} className="h-4 w-4" />
                  {formatCurrency({ amount: totalAwarded, showUSD, exchangeRate, shorten: true })}
                </span>
              </Tooltip>
            )}
          </div>
        )}

        {children}
      </div>

      {canTip && (
        <TipContentModal
          isOpen={isTipModalOpen}
          onClose={() => setIsTipModalOpen(false)}
          contentId={comment.id}
          feedContentType="COMMENT"
          recipientName={createdBy.fullName}
        />
      )}

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
