'use client';

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemBody } from './FeedItemBody';
import { FeedItemActions } from './FeedItemActions';
import { cn } from '@/utils/styles';

interface FeedItemProps {
  entry: FeedEntry;
  isFirst?: boolean;
  customBody?: React.ReactNode;
}

export const FeedItem: FC<FeedItemProps> = ({ entry, isFirst, customBody }) => {
  const { content, metrics } = entry;

  return (
    <div className={cn('relative', !isFirst && 'mt-6')}>
      <div>
        <FeedItemHeader
          action={entry.action || 'shared'}
          timestamp={entry.timestamp}
          content={content}
        />

        <div className="mt-2">
          {customBody ? customBody : <FeedItemBody content={content} metrics={metrics} />}

          <div className="pt-3">
            <FeedItemActions metrics={metrics} content={content} />
          </div>
        </div>
      </div>
    </div>
  );
};
