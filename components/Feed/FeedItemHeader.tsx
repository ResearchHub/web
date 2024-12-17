'use client'

import { FC } from 'react';
import { FeedActionType, FeedEntry, FeedItemType } from '@/types/feed';
import { formatTimestamp } from '@/utils/date';
import { Avatar } from '@/components/ui/Avatar';
import {
  Repeat,
  MoreHorizontal,
  Coins,
  FileText,
  MessageCircle,
  HandCoins,
  Trophy,
  GraduationCap,
  Star,
} from 'lucide-react';
import { assertNever } from '@/utils/assertNever';

export const FeedItemHeader: FC<{
  actor: FeedEntry['actor'];
  timestamp: string;
  action: FeedActionType;
  item: FeedItemType;
  isReposted?: boolean;
}> = ({ actor, timestamp, action, item, isReposted }) => {
  const getActionText = () => {
    switch (action) {
      case 'repost':
        return 'Reposted';
      case 'contribute':
        return 'Contributed RSC';
      case 'publish':
        return 'Published';
      case 'post':
        switch (item.type) {
          case 'comment':
            return 'Commented';
          case 'funding_request':
            return 'Started crowdfund';
          case 'reward':
            return 'Opened reward';
          case 'grant':
            return 'Published grant';
          case 'paper':
            return 'Published paper';
          case 'review':
            return 'Reviewed';
          case 'contribution':
            return 'Contributed';
          default:
            return assertNever(item);
        }
      default:
        return assertNever(action);
    }
  };

  const getActionIcon = () => {
    switch (action) {
      case 'repost':
        return <Repeat className="w-3.5 h-3.5" />;
      case 'contribute':
        return <Coins className="w-3.5 h-3.5" />;
      case 'publish':
        return <FileText className="w-3.5 h-3.5" />;
      case 'post':
        switch (item.type) {
          case 'comment':
            return <MessageCircle className="w-3.5 h-3.5" />;
          case 'funding_request':
            return <HandCoins className="w-3.5 h-3.5" />;
          case 'reward':
            return <Trophy className="w-3.5 h-3.5" />;
          case 'grant':
            return <GraduationCap className="w-3.5 h-3.5" />;
          case 'paper':
            return <FileText className="w-3.5 h-3.5" />;
          case 'review':
            return <Star className="w-3.5 h-3.5" />;
          case 'contribution':
            return <Coins className="w-3.5 h-3.5" />;
          default:
            return assertNever(item);
        }
      default:
        return assertNever(action);
    }
  };

  return (
    <div className="flex items-start justify-between group">
      <div className="flex items-center space-x-3">
        <div className="relative">
          <Avatar
            src={actor.authorProfile?.profileImage}
            alt={actor.fullName}
            size="sm"
            className="ring-2 ring-gray-100 transition-all duration-200"
          />
          <div className="absolute -bottom-2 -right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-md ring-1 ring-gray-200">
            {getActionIcon()}
          </div>
        </div>
        <div className="-mt-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5">
            <a href="#" className="text-sm font-semibold text-gray-900 hover:text-orange-500 transition-colors duration-200">
              {actor.fullName}
            </a>
            <span className="text-gray-500 text-sm">{getActionText()}</span>
            <span className="text-gray-400">·</span>
            <button className="text-gray-400 hover:text-gray-600 text-sm transition-colors duration-200">
              {formatTimestamp(timestamp)}
            </button>
          </div>
          {actor.authorProfile?.title && (
            <div className="mt-0.5 text-sm text-gray-500">{actor.authorProfile.title}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isReposted && (
          <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-all duration-200 p-1 hover:bg-gray-50 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}; 