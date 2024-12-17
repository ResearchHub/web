'use client'

import { FC } from 'react';
import { FeedActionType, FeedEntry, FeedItemType } from '@/types/feed';
import { formatTimestamp } from '@/utils/date';
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
        return <Repeat className="w-4 h-4 text-gray-500" />;
      case 'contribute':
        return <Coins className="w-4 h-4 text-gray-500" />;
      case 'publish':
        return <FileText className="w-4 h-4 text-gray-500" />;
      case 'post':
        switch (item.type) {
          case 'comment':
            return <MessageCircle className="w-4 h-4 text-gray-500" />;
          case 'funding_request':
            return <HandCoins className="w-4 h-4 text-gray-500" />;
          case 'reward':
            return <Trophy className="w-4 h-4 text-gray-500" />;
          case 'grant':
            return <GraduationCap className="w-4 h-4 text-gray-500" />;
          case 'paper':
            return <FileText className="w-4 h-4 text-gray-500" />;
          case 'review':
            return <Star className="w-4 h-4 text-gray-500" />;
          case 'contribution':
            return <Coins className="w-4 h-4 text-gray-500" />;
          default:
            return assertNever(item);
        }
      default:
        return assertNever(action);
    }
  };

  return (
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-3">
        <img
          src={actor.authorProfile?.profileImage}
          alt={actor.fullName}
          className={`rounded-full ring-2 ring-gray-100 ${isReposted ? 'w-5 h-5' : 'w-10 h-10'}`}
        />
        <div>
          <div className="flex items-center space-x-2">
            <span className={`font-semibold text-gray-900 text-sm`}>
              {actor.fullName}
            </span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>•</span>
            <span className={`text-gray-500 ${isReposted ? 'text-xs' : 'text-sm'}`}>
              {formatTimestamp(timestamp)}
            </span>
          </div>
          <div className="flex items-center mt-0.5 space-x-2 text-sm">
            <span className="flex items-center space-x-2 text-gray-500">
              {getActionIcon()}
              <span>{getActionText()}</span>
            </span>
          </div>
        </div>
      </div>
      {!isReposted && (
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}; 