'use client'

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemBody } from './FeedItemBody';
import { FeedItemActions } from './FeedItemActions';
import clsx from 'clsx';

export const FeedItem: FC<{ entry: FeedEntry; isFirst?: boolean }> = ({ entry, isFirst }) => {
  const { action, actor, timestamp, item, relatedItem, metrics } = entry;
  
  const repostMessage = action === 'repost' 
    ? (entry as { repostMessage?: string }).repostMessage 
    : undefined;

  return (
    <div 
      className={clsx(
        'relative bg-white',
        !isFirst && 'mt-8'
      )}
    >
      <div>
        <FeedItemHeader 
          actor={actor} 
          timestamp={timestamp} 
          action={action} 
          item={item} 
        />
        <div className="pl-11">
          <FeedItemBody 
            item={item} 
            relatedItem={relatedItem} 
            action={action} 
            repostMessage={repostMessage}
          />
          <div className="mt-4 -mx-4 px-4">
            <FeedItemActions metrics={metrics} item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}; 