'use client'

import { FC } from 'react';
import { FeedEntry, FeedItemType } from '@/types/feed';
import {
  MessageCircle,
  Repeat,
  Bookmark,
  Share,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const FeedItemActions: FC<{
  metrics: FeedEntry['metrics'];
  item: FeedItemType;
}> = ({ metrics, item }) => {
  return (
    <div className="flex items-center space-x-0.5">
      <Button
        variant="ghost"
        size="sm"
        tooltip="Comment"
        className="-ml-3 flex items-center text-gray-900 hover:text-gray-900 h-7"
      >
        <div className="flex items-center justify-center w-7">
          <MessageCircle className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        </div>
        {metrics?.comments > 0 && (
          <span className="text-sm font-medium pr-1.5">
            {metrics.comments}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        tooltip="Repost"
        className="flex items-center text-gray-900 hover:text-gray-900 h-7"
      >
        <div className="flex items-center justify-center w-7">
          <Repeat className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        </div>
        {metrics?.reposts > 0 && (
          <span className="text-sm font-medium pr-1.5">
            {metrics.reposts}
          </span>
        )}
      </Button>

      <Button
        variant="ghost"
        size="sm"
        tooltip="Save"
        className="flex items-center text-gray-900 hover:text-gray-900 h-7"
      >
        <div className="flex items-center justify-center w-7">
          <Bookmark className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        </div>
        {metrics?.saves > 0 && (
          <span className="text-sm font-medium pr-1.5">
            {metrics.saves}
          </span>
        )}
      </Button>

      <Button 
        variant="ghost"
        size="sm"
        tooltip="Share"
        className="flex items-center text-gray-900 hover:text-gray-900 h-7"
      >
        <div className="flex items-center justify-center w-7">
          <Share className="w-[18px] h-[18px] transition-transform duration-200 group-hover:scale-110" />
        </div>
      </Button>
    </div>
  );
}; 