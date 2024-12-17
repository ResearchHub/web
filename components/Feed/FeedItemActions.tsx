'use client'

import { FC } from 'react';
import { FeedEntry, FeedItemType } from '@/types/feed';
import {
  MessageCircle,
  Repeat,
  Bookmark,
  ExternalLink,
} from 'lucide-react';

export const FeedItemActions: FC<{
  metrics: FeedEntry['metrics'];
  item: FeedItemType;
}> = ({ metrics, item }) => {
  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm">{metrics?.comments || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors">
        <Repeat className="w-5 h-5" />
        <span className="text-sm">{metrics?.reposts || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-orange-500 transition-colors">
        <Bookmark className="w-5 h-5" />
        <span className="text-sm">{metrics?.saves || 0}</span>
      </button>
      <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors" title="Open in new tab">
        <ExternalLink className="w-5 h-5" />
      </button>
    </div>
  );
}; 