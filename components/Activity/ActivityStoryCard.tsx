'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { PeerReviewModal } from '@/components/modals/PeerReviewModal';
import type { FeedEntry } from '@/types/feed';
import { ActivityStoryBackgroundCard } from './ActivityStoryBackgroundCard';
import { ActivityStoryPlainCard } from './ActivityStoryPlainCard';
import { ActivityStoryPlayableCard } from './ActivityStoryPlayableCard';
import { isPlayable, resolveBackground, transformStoryDetails } from './types';

interface ActivityStoryCardProps {
  entry: FeedEntry;
}

/**
 * Story-styled card for an activity feed entry. Renders peer reviews and
 * author updates (other entry types are skipped). Variant picked by content:
 *  - Author update with playable embed (YT/TikTok/X/LinkedIn/webpage) → PlayableCard
 *  - Has a media background (work image / brand) → BackgroundCard
 *  - Otherwise → PlainCard
 */
export const ActivityStoryCard: FC<ActivityStoryCardProps> = ({ entry }) => {
  const details = transformStoryDetails(entry);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  if (!details || !details.author) return null;

  if (details.kind === 'update' && isPlayable(details.embed)) {
    const card = (
      <ActivityStoryPlayableCard
        details={details}
        embed={details.embed!}
        timestamp={entry.timestamp}
      />
    );
    return details.href ? (
      <Link href={details.href} className="block">
        {card}
      </Link>
    ) : (
      card
    );
  }

  const onReadReview = details.kind === 'review' ? () => setIsReviewModalOpen(true) : undefined;
  const background = resolveBackground(details);
  const card = background ? (
    <ActivityStoryBackgroundCard
      details={details}
      timestamp={entry.timestamp}
      background={background}
      onReadReview={onReadReview}
    />
  ) : (
    <ActivityStoryPlainCard
      details={details}
      timestamp={entry.timestamp}
      onReadReview={onReadReview}
    />
  );

  return (
    <>
      {details.href ? (
        <Link href={details.href} className="block">
          {card}
        </Link>
      ) : (
        card
      )}
      {details.kind === 'review' && (
        <PeerReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          reviewer={details.author}
          score={details.score}
          content={details.content}
          contentFormat={details.contentFormat}
          workTitle={details.workTitle}
        />
      )}
    </>
  );
};
