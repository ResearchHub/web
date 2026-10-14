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
import { ActivityCardFooter } from '../work/ActivityCardFooter';
import { ActivityWorkCover } from '../work/ActivityWorkCover';
import {
  getActivityActionLine,
  getActivityComment,
  getActivityHeaderMessage,
  getCommentPreview,
  isDocumentPublication,
  toReviewVerdictPreview,
} from '../lib/activityDisplay.utils';
import {
  getActivityCta,
  getActivityWork,
  getWorkCoverPresentation,
  shouldShowAuthorBadge,
} from '../lib/activityWork.utils';
import type { AuthorProfile } from '@/types/authorProfile';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardProps {
  entry: FeedEntry;
  hideActions?: boolean;
  /** Author whose profile the card appears on. */
  profileAuthor?: AuthorProfile;
}

/**
 * One activity, as a card of its own: who acted, what they did, their words, the
 * work it happened on, and one thing the reader can do about it.
 */
export const ActivityCard: FC<ActivityCardProps> = ({
  entry,
  hideActions = false,
  profileAuthor,
}) => {
  const work = getActivityWork(entry);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  // The panel shows the card's own words, or the comment they reply to.
  const [panelShowsParent, setPanelShowsParent] = useState(false);

  if (!work) return null;

  const entryId = String(entry.id);
  const message = getActivityHeaderMessage(entry, profileAuthor);
  // A co-authored document is credited to all of its authors at once.
  const isCoAuthored = isDocumentPublication(entry) && (work.authors?.length ?? 0) > 1;
  const authors = isCoAuthored && work.authors ? work.authors : [message.actor];
  const commentPreview = getCommentPreview(entry);
  const cover = getWorkCoverPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });
  const showComment = cover.showComment && !!commentPreview;
  // The words in full, for the side panel that "Read more" and "Read review" open.
  const comment = getActivityComment(entry);
  const openPanel = (showParent: boolean) => {
    setPanelShowsParent(showParent);
    setIsPanelOpen(true);
  };
  const openComment = comment ? () => openPanel(false) : undefined;
  const openParent = comment?.parent ? () => openPanel(true) : undefined;
  const panelComment = panelShowsParent && comment?.parent ? comment.parent : comment;

  return (
    <ActivityCardShell entryId={entryId}>
      <ActivityActor
        authors={authors}
        action={getActivityActionLine(entry, work)}
        timestamp={entry.timestamp}
        isAuthor={!isCoAuthored && shouldShowAuthorBadge(entry, message.actor.id)}
        menu={hideActions ? undefined : <ActivityCardMenu work={work} hideableEntries={[entry]} />}
        footer={
          hideActions ? undefined : (
            <ActivityCardFooter
              entry={entry}
              work={work}
              cta={getActivityCta(entry, work)}
              onOpenComment={openComment}
            />
          )
        }
      >
        {showComment && commentPreview && (
          <div className={ACTIVITY_CONTENT_DIVIDER}>
            {comment?.parent && (
              <ActivityQuotedComment
                comment={comment.parent}
                onOpen={openParent}
                className="mb-3"
              />
            )}
            <CommentReadOnly
              content={
                commentPreview.isReview
                  ? toReviewVerdictPreview(commentPreview.content)
                  : commentPreview.content
              }
              contentFormat={commentPreview.format}
              maxLength={250}
              showReadMoreButton
              showLinkPreviews={false}
              onReadMore={openComment}
              className="feed-comment-preview text-[15px] leading-6 text-gray-700"
            />
          </div>
        )}

        <ActivityWorkCover
          work={work}
          cover={cover}
          onNavigate={() => updateLastClickedEntryId(entryId)}
          className="mt-3"
        />
      </ActivityActor>

      {panelComment && (
        <ActivityCommentPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          comment={panelComment}
          work={work}
          onOpenParent={panelShowsParent ? undefined : openParent}
        />
      )}
    </ActivityCardShell>
  );
};
