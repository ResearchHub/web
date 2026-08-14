'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useNavigation } from '@/contexts/NavigationContext';
import { ActivityCardHeader } from './ActivityCardHeader';
import { ActivityWorkActions } from '../work/ActivityWorkActions';
import { ActivityWorkMetadata } from '../work/ActivityWorkMetadata';
import { WorkPreviewCard } from '../work/WorkPreviewCard';
import { getActivityHeaderMessage, getCommentPreview } from '../lib/activityDisplay.utils';
import { getActivityWork, getWorkCardPresentation } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardProps {
  entry: FeedEntry;
}

export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const work = getActivityWork(entry);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { updateLastClickedEntryId } = useNavigation();

  if (!work) return null;

  const entryId = String(entry.id);
  const message = getActivityHeaderMessage(entry);
  const commentPreview = getCommentPreview(entry);
  const presentation = getWorkCardPresentation(entry, work, {
    showUSD,
    exchangeRate,
    isReview: commentPreview?.isReview,
  });
  const showComment = presentation.showComment && !!commentPreview;

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
          <ActivityCardHeader entry={entry} work={work} />

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
                <ActivityWorkActions
                  entry={entry}
                  work={work}
                  presentation={presentation}
                  onNavigate={markEntryClicked}
                />
              </WorkPreviewCard.Actions>
            </WorkPreviewCard>
          </div>
        </div>
      </div>
    </article>
  );
};
