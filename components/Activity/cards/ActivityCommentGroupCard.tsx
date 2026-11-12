'use client';

import { FC, useState } from 'react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ActivityCommentPanel } from '@/components/modals/ActivityCommentPanel';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityActor } from './ActivityActor';
import { ActivityCardMenu } from './ActivityCardMenu';
import { ACTIVITY_CONTENT_DIVIDER, ActivityCardShell } from './ActivityCardShell';
import { ActivityQuotedComment } from './ActivityQuotedComment';
import { ReviewScoreStars } from '../amounts/ReviewScoreStars';
import { ActivityCardFooter } from '../work/ActivityCardFooter';
import { ActivityWorkCover } from '../work/ActivityWorkCover';
import { ActivityWorkLink } from '../work/ActivityWorkLink';
import {
  getActivityComment,
  getCommentPreview,
  getReviewScore,
  getWorkNoun,
  toReviewVerdictPreview,
} from '../lib/activityDisplay.utils';
import {
  getActivityCta,
  getWorkCoverPresentation,
  shouldShowAuthorBadge,
} from '../lib/activityWork.utils';
import type { ActivityCommentGroupRow } from '../lib/activityGrouping.utils';
import { cn } from '@/utils/styles';

/**
 * Bodies start clipped far shorter than the 250 characters a lone comment gets, so
 * that several of them fit where one card used to. Each keeps its own read-more, so
 * the row opens up one comment at a time rather than all at once.
 */
const GROUPED_COMMENT_MAX_LENGTH = 120;

/** How many comments or reviews show before the rest fold behind "See all". */
const PREVIEW_COUNT = 2;

interface ActivityCommentGroupCardProps {
  row: ActivityCommentGroupRow;
}

/**
 * A single row standing in for several comments one author left back to back:
 * every comment body, stacked above one shared work cover when they are all on one
 * work, or each under a small link to its own work when they are not.
 */
export const ActivityCommentGroupCard: FC<ActivityCommentGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, works, spansWorks, author, variant } = row;
  const isReview = variant === 'review';
  const [isExpanded, setIsExpanded] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();
  // Which comment the side panel shows, kept after closing so it can slide out.
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // Whether the panel shows that comment, or the one it replies to.
  const [panelShowsParent, setPanelShowsParent] = useState(false);
  const openPanel = (entryId: string, showParent: boolean) => {
    setActiveEntryId(entryId);
    setPanelShowsParent(showParent);
    setIsPanelOpen(true);
  };

  const latestEntryId = String(latestEntry.id);
  const cover = getWorkCoverPresentation(latestEntry, work, { showUSD, exchangeRate, isReview });

  const comments = entries.flatMap((entry, index) => {
    const preview = getCommentPreview(entry);
    return preview
      ? [
          {
            entryId: String(entry.id),
            preview,
            comment: getActivityComment(entry),
            commentWork: works[index] ?? work,
            score: isReview ? getReviewScore(entry) : undefined,
          },
        ]
      : [];
  });
  const activeComment = comments.find(({ entryId }) => entryId === activeEntryId)?.comment;
  const activeWork = comments.find(({ entryId }) => entryId === activeEntryId)?.commentWork ?? work;
  const visibleComments = isExpanded ? comments : comments.slice(0, PREVIEW_COUNT);
  const hiddenCount = comments.length - visibleComments.length;
  const noun = isReview ? 'reviews' : 'comments';
  const panelComment =
    panelShowsParent && activeComment?.parent ? activeComment.parent : activeComment;

  return (
    <ActivityCardShell
      entryId={latestEntryId}
      // Absorbed members keep an anchor here so scroll restoration can find them.
      entryIds={entries.map((entry) => String(entry.id))}
    >
      <ActivityActor
        authors={[author]}
        action={{
          label: isReview
            ? spansWorks
              ? `Peer reviewed ${comments.length} works`
              : `Wrote ${comments.length} peer reviews on ${getWorkNoun(work)}`
            : spansWorks
              ? `Left ${comments.length} comments`
              : `Left ${comments.length} comments on ${getWorkNoun(work)}`,
        }}
        timestamp={latestEntry.timestamp}
        isAuthor={shouldShowAuthorBadge(latestEntry, author.id)}
        menu={<ActivityCardMenu work={work} hideableEntries={entries} />}
      >
        <div className={cn(ACTIVITY_CONTENT_DIVIDER, 'divide-y divide-gray-100')}>
          {visibleComments.map(({ entryId, preview, comment, commentWork, score }) => (
            <div key={entryId} className="py-2.5 first:pt-0 last:pb-0">
              {spansWorks && (
                <ActivityWorkLink
                  work={commentWork}
                  onNavigate={() => updateLastClickedEntryId(entryId)}
                  className="mb-1 pt-0"
                />
              )}
              {comment?.parent && (
                <ActivityQuotedComment
                  comment={comment.parent}
                  onOpen={() => openPanel(entryId, true)}
                  className="mb-3"
                />
              )}
              {!!score && <ReviewScoreStars score={score} size="sm" className="mb-1" />}
              <CommentReadOnly
                content={isReview ? toReviewVerdictPreview(preview.content) : preview.content}
                contentFormat={preview.format}
                maxLength={GROUPED_COMMENT_MAX_LENGTH}
                showReadMoreButton
                showLinkPreviews={false}
                onReadMore={comment ? () => openPanel(entryId, false) : undefined}
                className="feed-comment-preview text-[15px] leading-6 text-gray-900"
              />
            </div>
          ))}
        </div>

        {hiddenCount > 0 && (
          <button
            type="button"
            onClick={() => setIsExpanded(true)}
            className="mt-2 text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            See all {comments.length} {noun}
          </button>
        )}

        {/* Across several works there is no one work to show or act on. */}
        {!spansWorks && (
          <>
            <ActivityWorkCover
              work={work}
              cover={cover}
              onNavigate={() => updateLastClickedEntryId(latestEntryId)}
              className="mt-3"
            />

            <ActivityCardFooter
              entry={latestEntry}
              work={work}
              cta={getActivityCta(latestEntry, work)}
              hideableEntries={entries}
            />
          </>
        )}
      </ActivityActor>

      {panelComment && activeEntryId && (
        <ActivityCommentPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          comment={panelComment}
          work={activeWork}
          onOpenParent={
            !panelShowsParent && activeComment?.parent
              ? () => openPanel(activeEntryId, true)
              : undefined
          }
        />
      )}
    </ActivityCardShell>
  );
};
