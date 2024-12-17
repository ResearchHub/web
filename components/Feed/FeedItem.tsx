'use client'

import { FC } from 'react';
import { FeedEntry } from '@/types/feed';
import { FeedItemHeader } from './FeedItemHeader';
import { FeedItemBody } from './FeedItemBody';
import { FeedItemActions } from './FeedItemActions';

export const FeedItem: FC<{ entry: FeedEntry }> = ({ entry }) => {
  const { action, actor, timestamp, item, relatedItem, metrics } = entry;
  
  const repostMessage = action === 'repost' 
    ? (entry as { repostMessage?: string }).repostMessage 
    : undefined;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <FeedItemHeader 
          actor={actor} 
          timestamp={timestamp} 
          action={action} 
          item={item} 
        />
        <FeedItemBody 
          item={item} 
          relatedItem={relatedItem} 
          action={action} 
          repostMessage={repostMessage}
        />
        <FeedItemActions metrics={metrics} item={item} />
      </div>
    </div>
  );
}; 