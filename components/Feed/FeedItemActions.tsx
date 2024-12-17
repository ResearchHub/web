'use client'

import { FC } from 'react';
import { FeedEntry, FeedItemType } from '@/types/feed';
import {
  MessageCircle,
  Repeat,
  Bookmark,
  Share2,
} from 'lucide-react';

export const FeedItemActions: FC<{
  metrics: FeedEntry['metrics'];
  item: FeedItemType;
}> = ({ metrics, item }) => {
  return (
    <div className="flex items-center border-t border-gray-100 pt-3">
      <button className="group flex items-center gap-2 p-2 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200">
        <MessageCircle className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        {metrics?.comments > 0 && (
          <span className="text-sm font-medium min-w-[20px]">{metrics.comments}</span>
        )}
      </button>

      <button className="group flex items-center gap-2 p-2 text-gray-500 hover:text-green-600 rounded-lg hover:bg-green-50 transition-all duration-200">
        <Repeat className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        {metrics?.reposts > 0 && (
          <span className="text-sm font-medium min-w-[20px]">{metrics.reposts}</span>
        )}
      </button>

      <button className="group flex items-center gap-2 p-2 text-gray-500 hover:text-orange-500 rounded-lg hover:bg-orange-50 transition-all duration-200">
        <Bookmark className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        {metrics?.saves > 0 && (
          <span className="text-sm font-medium min-w-[20px]">{metrics.saves}</span>
        )}
      </button>

      <button 
        className="group flex items-center gap-2 p-2 text-gray-500 hover:text-gray-600 rounded-lg hover:bg-gray-50 transition-all duration-200" 
        title="Share"
      >
        <Share2 className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
      </button>
    </div>
  );
}; 