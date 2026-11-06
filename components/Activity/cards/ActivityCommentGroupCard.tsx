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
import { getActivityComment, getCommentPreview, getWorkNoun } from '../lib/activityDisplay.utils';
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

interface ActivityCommentGroupCardProps {
  row: ActivityCommentGroupRow;
}

/**
 * A single row standing in for several comments one author left on the same work:
 * every comment body, stacked above one shared work cover.
 */
export const ActivityCommentGroupCard: FC<ActivityCommentGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, author } = row;
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
  const cover = getWorkCoverPresentation(latestEntry, work, { showUSD, exchangeRate });

  const comments = entries.flatMap((entry) => {
    const preview = getCommentPreview(entry);
    return preview
      ? [{ entryId: String(entry.id), preview, comment: getActivityComment(entry) }]
      : [];
  });
  const activeComment = comments.find(({ entryId }) => entryId === activeEntryId)?.comment;
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
        action={{ label: `Left ${comments.length} comments on ${getWorkNoun(work)}` }}
        timestamp={latestEntry.timestamp}
        isAuthor={shouldShowAuthorBadge(latestEntry, author.id)}
        menu={<ActivityCardMenu work={work} hideableEntries={entries} />}
      >
        <div className={cn(ACTIVITY_CONTENT_DIVIDER, 'divide-y divide-gray-100')}>
          {comments.map(({ entryId, preview, comment }) => (
            <div key={entryId} className="py-2.5 first:pt-0 last:pb-0">
              {comment?.parent && (
                <ActivityQuotedComment
                  comment={comment.parent}
                  onOpen={() => openPanel(entryId, true)}
                  className="mb-3"
                />
              )}
              <CommentReadOnly
                content={preview.content}
                contentFormat={preview.format}
                maxLength={GROUPED_COMMENT_MAX_LENGTH}
                showReadMoreButton
                showLinkPreviews={false}
                onReadMore={comment ? () => openPanel(entryId, false) : undefined}
                variant="preview"
              />
            </div>
          ))}
        </div>

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
      </ActivityActor>

      {panelComment && activeEntryId && (
        <ActivityCommentPanel
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          comment={panelComment}
          work={work}
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
