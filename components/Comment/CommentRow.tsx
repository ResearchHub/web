'use client';

import { FC, ReactNode, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Flag, MoreHorizontal, Pen, Star, Trash2 } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EditorBadge } from '@/components/ui/EditorBadge';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { isFoundationUser } from '@/components/Bounty/lib/bountyUtil';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useUser } from '@/contexts/UserContext';
import { useFlagModal } from '@/hooks/useFlagging';
import type { Comment } from '@/types/comment';
import type { ContentType, Work } from '@/types/work';
import { formatTimeAgoShort } from '@/utils/date';

interface CommentRowProps {
  comment: Comment;
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

/**
 * A comment, reply or peer review laid out like a professional-network thread:
 * avatar, name with headline under it, time and menu on the right, the words,
 * then the vote, reply and tip actions.
 */
export const CommentRow: FC<CommentRowProps> = ({
  comment,
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
  const { isOpen: isFlagOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [showLegacyCommentBanner, setShowLegacyCommentBanner] = useState(false);

  const { createdBy } = comment;
  const author = createdBy.authorProfile;
  const authorId = author?.id;
  const isReply = typeof comment.parentId === 'number';
  const isWorkAuthor = !!work?.authors?.some((a) => a.authorProfile.id === authorId);
  const isEditor = !isWorkAuthor && !!author?.editorOfHubs?.length;
  const isVerified = createdBy.isVerified || author?.isVerified;
  const isReview = comment.commentType === 'REVIEW';
  const canTip = isFoundationUser(user?.id) && !isCurrentUserAuthor;
  const isAssessedByFoundation =
    isReview &&
    comment.isAssessed &&
    String(createdBy.id) !== process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;
  const relatedDocumentId = comment.thread?.objectId?.toString();
  const canReport = !isCurrentUserAuthor && !!relatedDocumentId;
  const showMenu = !hideActions && (isCurrentUserAuthor || canReport);

  const handleReport = () => {
    executeAuthenticatedAction(() => {
      if (relatedDocumentId) {
        openFlagModal(relatedDocumentId, contentType, comment.id.toString());
      }
    });
  };

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
              {isEditor && <EditorBadge hubs={author?.editorOfHubs} size="sm" />}
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
              {isCurrentUserAuthor && (
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
              {isCurrentUserAuthor && (
                <BaseMenuItem onClick={onDelete}>
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
          <div className="mt-1">
            <FeedItemActions
              metrics={{ votes: comment.score, comments: comment.childrenCount }}
              userVote={comment.userVote}
              feedContentType="COMMENT"
              votableEntityId={comment.id}
              relatedDocumentId={relatedDocumentId}
              relatedDocumentContentType={contentType}
              relatedDocumentTopics={work?.topics}
              actionLabels={{ comment: 'Reply' }}
              onComment={onReply && (() => executeAuthenticatedAction(onReply))}
              onTip={canTip ? () => setIsTipModalOpen(true) : undefined}
              tips={comment.tips}
              awardedBountyAmount={comment.awardedBountyAmount}
              hideMoreMenu
              variant="inline"
            />
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
