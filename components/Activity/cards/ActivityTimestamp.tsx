'use client';

import { FC } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';

interface ActivityTimestampProps {
  timestamp: string;
  className?: string;
}

/**
 * Tooltip's trigger is `inline-flex h-full` so it can sit in a header row. That
 * stretches this footer to the card's height and paints the time at the top, so
 * the used size is restored here.
 */
export const ActivityTimestamp: FC<ActivityTimestampProps> = ({ timestamp, className }) => {
  return (
    <Tooltip
      content={new Date(timestamp).toLocaleString()}
      wrapperClassName={cn('flex h-auto w-fit', className)}
    >
      <span className="text-xs leading-6 text-gray-400 cursor-default whitespace-nowrap">
        {formatTimeAgo(timestamp)}
      </span>
    </Tooltip>
  );
};
