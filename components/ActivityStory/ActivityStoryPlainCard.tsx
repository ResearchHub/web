'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/date';
import { ACCENT, type StoryDetails } from './types';
import { ActionIcon, ReviewScoreRow, TopBadge } from './lib/ActivityStoryBadges';
import { ReviewBody, UpdateBody } from './lib/ActivityStoryBodies';
import { ReadReviewButton } from './lib/ActivityStoryButtons';
import { cn } from '@/utils/styles';

interface ActivityStoryPlainCardProps {
  details: StoryDetails;
  timestamp: string;
  onReadReview?: () => void;
}

/**
 * Light-background card variant — used when no media background is available
 * (no work image, no playable embed, no brand tile).
 */
export const ActivityStoryPlainCard: FC<ActivityStoryPlainCardProps> = ({
  details,
  timestamp,
  onReadReview,
}) => (
  <div
    className={cn(
      'snap-start shrink-0 relative w-[280px] h-[360px] flex flex-col rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden',
      'group hover:shadow-md hover:border-primary-200 transition-all'
    )}
  >
    <div className={cn('h-1 w-full', ACCENT[details.kind])} />
    <TopBadge details={details} />
    {onReadReview && <ReadReviewButton onClick={onReadReview} />}

    <div className="flex items-center gap-2.5 px-4 pt-3.5">
      <Avatar
        src={details.author.profileImage}
        alt={details.author.fullName || 'User'}
        size={36}
        authorId={details.author.id}
        disableTooltip
      />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
          {details.author.fullName || 'Unknown'}
        </div>
        {details.kind === 'review' && details.score != null && (
          <div className="mt-0.5">
            <ReviewScoreRow score={details.score} />
          </div>
        )}
        {details.kind === 'update' && (
          <div className="mt-0.5 inline-flex items-center gap-1 text-xs text-gray-500">
            <ActionIcon kind={details.kind} />
            <span className="truncate">{details.actionLabel}</span>
          </div>
        )}
      </div>
    </div>

    <div className="flex-1 px-4 mt-3 overflow-hidden">
      {details.kind === 'review' ? (
        <ReviewBody details={details} subtle={!!onReadReview} />
      ) : (
        <UpdateBody details={details} />
      )}
    </div>

    <div className="px-4 pt-2.5 pb-3 border-t border-gray-100 mt-2">
      {details.workTitle && (
        <div className="text-xs font-medium text-gray-700 line-clamp-1 mb-0.5 group-hover:text-primary-600 transition-colors">
          {details.workTitle}
        </div>
      )}
      <div className="text-[11px] text-gray-400">{formatTimeAgo(timestamp)}</div>
    </div>
  </div>
);
