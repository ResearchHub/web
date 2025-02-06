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
}

export const FeedItem: FC<FeedItemProps> = ({ entry, isFirst }) => {
  const { content, target, context, metrics } = entry;

  return (
    <div className={cn('relative', !isFirst && 'mt-6')}>
      <div>
        <FeedItemHeader
          action={entry.action}
          timestamp={entry.timestamp}
          content={content}
          target={target}
        />

        <div className="mt-2">
          <FeedItemBody
            content={content}
            target={target}
            context={context}
            metrics={metrics}
            contributors={entry.contributors}
          />

          <div className="pt-3">
            <FeedItemActions
              metrics={metrics}
              content={content}
              target={target}
              contributors={entry.contributors}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
