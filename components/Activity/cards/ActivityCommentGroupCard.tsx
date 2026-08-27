'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityCardHeader } from './ActivityCardHeader';
import { ActivityTimestamp } from './ActivityTimestamp';
import { ActivityWorkActions } from '../work/ActivityWorkActions';
import { ActivityWorkMetadata } from '../work/ActivityWorkMetadata';
import { WorkPreviewCard } from '../work/WorkPreviewCard';
import { getActivityHeaderMessage, getCommentPreview } from '../lib/activityDisplay.utils';
import { getWorkCardPresentation } from '../lib/activityWork.utils';
import type { ActivityCommentGroupRow } from '../lib/activityGrouping.utils';

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
 * every comment body, stacked above one shared work card.
 */
export const ActivityCommentGroupCard: FC<ActivityCommentGroupCardProps> = ({ row }) => {
  const { entries, latestEntry, work, author } = row;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  const latestEntryId = String(latestEntry.id);
  const presentation = getWorkCardPresentation(latestEntry, work, { showUSD, exchangeRate });

  const comments = entries.flatMap((entry) => {
    const preview = getCommentPreview(entry);
    return preview ? [{ entryId: String(entry.id), preview }] : [];
  });

  const message = getActivityHeaderMessage(latestEntry);
  const groupMessage = { ...message, verb: `posted ${comments.length} comments on` };

  const markEntryClicked = () => {
    updateLastClickedEntryId(latestEntryId);
  };

  return (
    <article
      className="py-4 border-b border-gray-100 last:border-b-0"
      data-entry-id={latestEntryId}
      // Absorbed members keep an anchor here so scroll restoration can find them.
      data-entry-ids={entries.map((entry) => String(entry.id)).join(' ')}
    >
      <div className="flex gap-2.5">
        <div className="flex w-8 flex-shrink-0 flex-col items-center">
          <div className="pt-0.5">
            <Avatar
              src={author.profileImage}
              alt={author.fullName || 'User'}
              size={32}
              authorId={author.id}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ActivityCardHeader entry={latestEntry} message={groupMessage} />

          <div className="divide-y divide-gray-100">
            {comments.map(({ entryId, preview }) => (
              <div key={entryId} className="py-2.5 first:pt-0 last:pb-0">
                <CommentReadOnly
                  content={preview.content}
                  contentFormat={preview.format}
                  maxLength={GROUPED_COMMENT_MAX_LENGTH}
                  showReadMoreButton
                  showLinkPreviews={false}
                  className="text-sm"
                />
              </div>
            ))}
          </div>

          <div className="mt-5 -ml-[42px] tablet:!ml-0">
            <WorkPreviewCard
              work={work}
              brand={presentation.brand}
              onNavigate={markEntryClicked}
              showPlaceholder
            >
              <WorkPreviewCard.Metadata>
                <ActivityWorkMetadata work={work} presentation={presentation} />
              </WorkPreviewCard.Metadata>
              <WorkPreviewCard.Actions>
                <ActivityWorkActions entry={latestEntry} work={work} hideableEntries={entries} />
              </WorkPreviewCard.Actions>
            </WorkPreviewCard>
            <ActivityTimestamp timestamp={latestEntry.timestamp} className="mt-3" />
          </div>
        </div>
      </div>
    </article>
  );
};
