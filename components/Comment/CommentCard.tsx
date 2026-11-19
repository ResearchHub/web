'use client';

import { FC, ReactNode, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { ActivityActor } from '@/components/Activity/cards/ActivityActor';
import { ACTIVITY_CONTENT_DIVIDER } from '@/components/Activity/cards/ActivityCardShell';
import {
  ACTIVITY_CTA_CLASS,
  ActivityFooterRow,
} from '@/components/Activity/cards/ActivityFooterRow';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import { LegacyCommentBanner } from '@/components/LegacyCommentBanner';
import { TipContentModal } from '@/components/modals/TipContentModal';
import { EditorBadge } from '@/components/ui/EditorBadge';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { CommentCardMenu } from './CommentCardMenu';
import { CommentReadOnly } from './CommentReadOnly';
import { FoundationAwardedBadge } from './FoundationAwardedBadge';
import { isFoundationAssessedReview } from './lib/reviewUtils';
import type { ActivityActionLine } from '@/components/Activity/lib/activityDisplay.utils';
import type { AuthorProfile } from '@/types/authorProfile';
import type { FeedCommentContent, FeedEntry } from '@/types/feed';
import type { ContentType } from '@/types/work';

/** Saves within a minute of posting don't count as edits, as in `CommentReadOnly`. */
const EDIT_GRACE_MS = 60_000;

/**
 * A reply's Reply button: smaller than the top-level row's, and only its icon below
 * the tablet breakpoint, where a reply's text column is as narrow as 192px.
 */
const COMPACT_REPLY_CLASS =
  'inline-flex h-8 flex-shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-gray-300 bg-white px-2 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-50 tablet:px-2.5';

interface CommentCardProps {
  /** The comment as a feed entry, from `transformCommentToFeedItem`. */
  entry: FeedEntry;
  /** 0 for a thread's first comment, 1 for a reply to it, 2+ for replies to replies. */
  depth?: number;
  /** Whose comment a reply at depth 2+ answers, named in its byline. */
  replyTo?: AuthorProfile;
  /** The viewer wrote this comment: no Tip on their own words. */
  isOwnComment?: boolean;
  onReply?: () => void;
  /** Offered in the ⋯ menu; pass only to the comment's author. */
  onEdit?: () => void;
  /** Offered in the ⋯ menu; pass only to the comment's author. */
  onDelete?: () => void;
  /** Leave out the menu, votes, Tip and Reply: read-only threads and removed comments. */
  hideActions?: boolean;
  showTooltips?: boolean;
  /** For the banner that explains why a legacy comment can't be edited. */
  workContentType?: ContentType;
  /** What they did, when the comment's type doesn't say: "Opened a bounty". */
  action?: ActivityActionLine;
  /** Under the words, before the footer: a bounty's solutions. */
  afterBody?: ReactNode;
  /** Replaces votes, Tip and Reply, whatever `hideActions` says: a bounty's action row. */
  footer?: ReactNode;
}

function getActionLine(
  comment: FeedCommentContent['comment'],
  depth: number,
  rating: number,
  replyTo?: AuthorProfile
): ActivityActionLine {
  if (depth >= 2 && replyTo) return { label: 'Replied to', target: replyTo };
  if (depth >= 1) return { label: 'Replied' };
  if (comment.commentType === 'REVIEW') {
    return rating > 0
      ? { label: 'Peer reviewed', value: { kind: 'score', score: rating } }
      : { label: 'Peer reviewed' };
  }
  if (comment.commentType === 'AUTHOR_UPDATE' || comment.thread?.threadType === 'AUTHOR_UPDATE') {
    return { label: 'Posted an update' };
  }
  if (comment.commentType === 'ANSWER') return { label: 'Answered' };
  return { label: 'Commented' };
}

function getEditedAt(createdDate: string, updatedDate?: string): string | undefined {
  if (!updatedDate) return undefined;
  const edited = new Date(updatedDate).getTime() - new Date(createdDate).getTime();
  return edited > EDIT_GRACE_MS ? updatedDate : undefined;
}

/**
 * One comment in a thread, drawn as the homepage's activity row: the avatar in its own
 * column, the name and what they did with when, a hairline, their words, then votes
 * and Tip on the left and Reply on the right. A reply under it uses a smaller avatar
 * and a compact Reply.
 */
export const CommentCard: FC<CommentCardProps> = ({
  entry,
  depth = 0,
  replyTo,
  isOwnComment = false,
  onReply,
  onEdit,
  onDelete,
  hideActions = false,
  showTooltips = true,
  workContentType,
  action,
  afterBody,
  footer,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [isTipModalOpen, setIsTipModalOpen] = useState(false);
  const [showLegacyBanner, setShowLegacyBanner] = useState(false);

  const commentEntry = entry.content as FeedCommentContent;
  const { comment, createdBy: author } = commentEntry;
  const isReply = depth > 0;
  const isRemoved = !!commentEntry.isRemoved;
  // The rating as given, never the payout-weighted score, so a paid review keeps its stars.
  const rating = comment.commentType === 'REVIEW' && !isRemoved ? comment.reviewScore || 0 : 0;
  const isLegacy = comment.contentFormat === 'QUILL_EDITOR';
  const isAuthorOfWork = !!entry.relatedWork?.authors?.some(
    (authorship) => authorship.authorProfile.id === author.id
  );
  const isEditor = !isAuthorOfWork && (author.editorOfHubs?.length ?? 0) > 0;
  const showAwarded =
    comment.commentType === 'REVIEW' &&
    isFoundationAssessedReview(entry.isAssessed ?? comment.isAssessed, author);

  // Quill comments predate the editor and can't be edited in it; say so instead.
  const handleEdit = onEdit && (isLegacy ? () => setShowLegacyBanner(true) : onEdit);

  return (
    <>
      <ActivityActor
        authors={[author]}
        action={action ?? getActionLine(comment, depth, rating, replyTo)}
        timestamp={commentEntry.createdDate}
        editedAt={getEditedAt(commentEntry.createdDate, commentEntry.updatedDate)}
        size={isReply ? 'sm' : 'md'}
        isAuthor={isAuthorOfWork}
        badges={
          (showAwarded || isEditor) && (
            <>
              {showAwarded && <FoundationAwardedBadge size="sm" />}
              {isEditor && (
                <EditorBadge hubs={author.editorOfHubs ?? []} size="sm" className="self-center" />
              )}
            </>
          )
        }
        menu={
          hideActions ? undefined : (
            <CommentCardMenu
              commentId={comment.id}
              relatedDocumentId={commentEntry.relatedDocumentId?.toString()}
              relatedDocumentContentType={commentEntry.relatedDocumentContentType}
              onEdit={handleEdit}
              onDelete={onDelete}
            />
          )
        }
      >
        <div className={ACTIVITY_CONTENT_DIVIDER}>
          {showLegacyBanner && (
            <LegacyCommentBanner
              contentType={workContentType}
              onClose={() => setShowLegacyBanner(false)}
            />
          )}
          <CommentReadOnly
            variant="full"
            content={comment.content}
            contentFormat={comment.contentFormat}
          />
        </div>

        {afterBody}

        {footer}

        {!footer && !hideActions && (
          <ActivityFooterRow
            actions={
              <FeedItemActions
                variant="card"
                metrics={entry.metrics}
                feedContentType="COMMENT"
                votableEntityId={comment.id}
                relatedDocumentId={commentEntry.relatedDocumentId?.toString()}
                relatedDocumentContentType={commentEntry.relatedDocumentContentType}
                userVote={entry.userVote}
                tips={entry.tips}
                awardedBountyAmount={entry.awardedBountyAmount}
                onTip={isOwnComment ? undefined : () => setIsTipModalOpen(true)}
                showTooltips={showTooltips}
                hideCommentButton
                hideShareButton
                hideReportButton
                hideMoreMenu
                // The up arrow is pulled out to sit flush with the text above.
                className="-ml-1.5 gap-2"
              />
            }
            cta={
              onReply &&
              (isReply ? (
                <button
                  type="button"
                  onClick={() => executeAuthenticatedAction(onReply)}
                  className={COMPACT_REPLY_CLASS}
                  aria-label="Reply"
                  data-testid="feed-item-comment-action"
                >
                  <MessageCircle className="h-[15px] w-[15px]" aria-hidden />
                  <span className="hidden tablet:inline">Reply</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => executeAuthenticatedAction(onReply)}
                  className={ACTIVITY_CTA_CLASS}
                  data-testid="feed-item-comment-action"
                >
                  Reply
                </button>
              ))
            }
          />
        )}
      </ActivityActor>

      {/* Mounted on first open: a long thread would otherwise hold one per comment. */}
      {isTipModalOpen && (
        <TipContentModal
          isOpen
          onClose={() => setIsTipModalOpen(false)}
          contentId={comment.id}
          feedContentType="COMMENT"
          recipientName={author.fullName}
        />
      )}
    </>
  );
};
