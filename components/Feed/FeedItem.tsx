'use client'

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemBody } from './FeedItemBody';
import { FeedItemActions } from './FeedItemActions';

export const FeedItem: FC<{ entry: FeedEntry; isLast?: boolean }> = ({ entry, isLast }) => {
  const { action, actor, timestamp, item, relatedItem, metrics } = entry;
  
  const repostMessage = action === 'repost' 
    ? (entry as { repostMessage?: string }).repostMessage 
    : undefined;

  return (
    <div className={`bg-white border rounded-md border-gray-200 ${!isLast ? 'mb-4' : ''}`}>
      <div className="p-6">
        <div className="space-y-4">
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
            <FeedItemActions metrics={metrics} item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}; 