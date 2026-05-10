'use client';

import { FC } from 'react';
import { Play } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/date';
import { ACCENT, type Background, type StoryDetails } from './types';
import { ActionIcon, BRAND, ReviewScoreRow, TopBadge } from './lib/ActivityStoryBadges';
import { ReviewBody, UpdateBody } from './lib/ActivityStoryBodies';
import { ReadReviewButton } from './lib/ActivityStoryButtons';
import { cn } from '@/utils/styles';

interface ActivityStoryBackgroundCardProps {
  details: StoryDetails;
  timestamp: string;
  background: Background;
  onReadReview?: () => void;
}

/**
 * Card variant with a media background — preview image or X/LinkedIn brand tile.
 * Used for peer reviews and author updates that don't have a playable embed.
 */
export const ActivityStoryBackgroundCard: FC<ActivityStoryBackgroundCardProps> = ({
  details,
  timestamp,
  background,
  onReadReview,
}) => (
  <div
    className={cn(
      'snap-start shrink-0 relative w-[280px] h-[360px] rounded-xl overflow-hidden',
      'border border-gray-200 shadow-sm group hover:shadow-lg transition-all'
    )}
  >
    {background.type === 'image' ? (
      <>
        <img
          src={background.url}
          alt=""
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {background.isVideoPreview && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-black/55 backdrop-blur-sm flex items-center justify-center ring-2 ring-white/30 transition-transform group-hover:scale-110">
              <Play size={22} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}
      </>
    ) : (
      <div
        className={cn(
          'absolute inset-0 flex items-center justify-center',
          BRAND[background.kind].bg
        )}
      >
        {BRAND[background.kind].glyph}
      </div>
    )}
    <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/40 to-black/75" />
    <div className={cn('absolute top-0 inset-x-0 h-1', ACCENT[details.kind])} />

    <TopBadge details={details} dark />
    {onReadReview && <ReadReviewButton onClick={onReadReview} />}

    <div className="relative h-full flex flex-col p-4 text-white">
      <div className="flex items-center gap-2.5">
        <Avatar
          src={details.author.profileImage}
          alt={details.author.fullName || 'User'}
          size={36}
          disableTooltip
          className="ring-2 ring-white/70"
        />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate leading-tight drop-shadow-md [text-shadow:0_1px_2px_rgba(0,0,0,0.45)]">
            {details.author.fullName || 'Unknown'}
          </div>
          {details.kind === 'review' && details.score != null && (
            <div className="mt-0.5">
              <ReviewScoreRow score={details.score} dark />
            </div>
          )}
          {details.kind === 'update' && (
            <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-white/80">
              <ActionIcon kind={details.kind} dark />
              <span className="truncate">{details.actionLabel}</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 mt-3 overflow-hidden">
        {details.kind === 'review' ? (
          <ReviewBody details={details} dark subtle={!!onReadReview} />
        ) : (
          <UpdateBody details={details} dark hideEmbedChip />
        )}
      </div>

      <div className="pt-2.5 mt-2 border-t border-white/15">
        {details.workTitle && (
          <div className="text-xs font-medium text-white/95 line-clamp-1 mb-0.5 drop-shadow">
            {details.workTitle}
          </div>
        )}
        <div className="text-[11px] text-white/65">{formatTimeAgo(timestamp)}</div>
      </div>
    </div>
  </div>
);
