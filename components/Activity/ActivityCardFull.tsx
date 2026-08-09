'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityCardHeader } from './ActivityCardHeader';
import { ActivityWorkActions } from './ActivityWorkActions';
import { ActivityWorkMetadata } from './ActivityWorkMetadata';
import { WorkPreviewCard } from './WorkPreviewCard';
import { getActivityHeaderMessage, getCommentPreview } from './lib/feedEntryAdapters';
import { getActivityWork, getWorkCardPresentation } from './lib/activityWorkContext';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardFullProps {
  entry: FeedEntry;
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({ entry }) => {
  const work = getActivityWork(entry);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  if (!work) return null;

  const entryId = String(entry.id);
  const message = getActivityHeaderMessage(entry);
  const commentPreview = getCommentPreview(entry);
  const { showComment: allowComment } = getWorkCardPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });
  const showComment = allowComment && !!commentPreview;

  const markEntryClicked = () => {
    updateLastClickedEntryId(entryId);
  };

  return (
    <article className="py-4 border-b border-gray-100 last:border-b-0" data-entry-id={entryId}>
      <div className="flex gap-2.5">
        <div className="flex w-8 flex-shrink-0 flex-col items-center">
          <div className="pt-0.5">
            <Avatar
              src={message.actor.profileImage}
              alt={message.actor.fullName || 'User'}
              size={32}
              authorId={message.actor.id}
            />
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <ActivityCardHeader entry={entry} />

          {showComment && commentPreview && (
            <div className="mt-2">
              <CommentReadOnly
                content={commentPreview.content}
                contentFormat={commentPreview.format}
                maxLength={250}
                showReadMoreButton
                showLinkPreviews={false}
                className="text-sm"
              />
            </div>
          )}

          <div className="mt-5 -ml-[42px] tablet:!ml-0">
            <WorkPreviewCard work={work} onNavigate={markEntryClicked} showPlaceholder>
              <WorkPreviewCard.Metadata>
                <ActivityWorkMetadata entry={entry} work={work} />
              </WorkPreviewCard.Metadata>
              <WorkPreviewCard.Actions>
                <ActivityWorkActions entry={entry} work={work} onNavigate={markEntryClicked} />
              </WorkPreviewCard.Actions>
            </WorkPreviewCard>
          </div>
        </div>
      </div>
    </article>
  );
};
