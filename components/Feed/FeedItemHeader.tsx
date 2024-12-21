'use client'

import { FC } from 'react';
import { FeedActionType, FeedItemType } from '@/types/feed';
import { User } from '@/types/user';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimestamp } from '@/utils/date';
import { assertNever } from '@/utils/assertNever';
import { 
  Repeat, 
  Coins, 
  FileText, 
  MessageCircle,
  HandCoins,
  Trophy,
  GraduationCap,
  Star
} from 'lucide-react';
import { AvatarStack } from '../ui/AvatarStack';
import { AuthorList } from '../ui/AuthorList';

interface FeedItemHeaderProps {
  actor: User;
  timestamp: string;
  action: FeedActionType;
  item: FeedItemType;
  isNested?: boolean;
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({ 
  actor, 
  timestamp, 
  action, 
  item,
  isNested 
}) => {
  const getActionText = () => {
    switch (action) {
      case 'repost':
        return 'reposted';
      case 'contribute':
        return 'contributed RSC';
      case 'publish':
        switch (item.type) {
          case 'paper':
            return 'published paper';
          case 'review':
            return 'published review';
          case 'comment':
            return 'published comment';
          case 'funding_request':
            return 'published funding request';
          case 'reward':
            return 'published reward';
          case 'grant':
            return 'published grant';
          case 'contribution':
            return 'published contribution';
          default:
            return assertNever(item);
        }
      case 'post':
        switch (item.type) {
          case 'comment':
            return 'Commented';
          case 'funding_request':
            return 'started crowdfund';
          case 'reward':
            return 'opened reward';
          case 'grant':
            return 'published grant';
          case 'paper':
            return 'published paper';
          case 'review':
            return 'reviewed';
          case 'contribution':
            return 'contributed';
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

  const hasAuthors = item.type === 'paper' && item.authors && item.authors.length > 0;
  const authors = hasAuthors ? item.authors : [];
  const textSize = isNested ? 'text-xs' : 'text-sm';

  return (
    <div className="flex items-start justify-between group">
      <div className="flex items-center space-x-4">
        <div className="relative">
          {hasAuthors ? (
            <AvatarStack
              items={authors.map(author => ({
                src: author.user?.authorProfile?.profileImage,
                alt: author.name,
                tooltip: author.name
              }))}
              size={isNested ? 'xs' : 'sm'}
              maxItems={1}
              spacing={-12}
              // reverseOrder
              // hideLabel
            />
          ) : (
            <Avatar
              src={actor.authorProfile?.profileImage}
              alt={actor.fullName}
              size={isNested ? 'xs' : 'sm'}
              className="ring-2 ring-gray-100 transition-all duration-200"
            />
          )}
        </div>
        <div className="-mt-0.5">
          <div className="flex flex-wrap items-center gap-x-1.5">
            {hasAuthors ? (
              <>
                <AuthorList 
                  authors={authors.map(author => ({
                    name: author.name,
                    verified: author.isVerified,
                    profileUrl: `/@${author.user?.username}`
                  }))}
                  size={isNested ? 'xs' : 'sm'}
                  className="font-semibold"
                />
                <span className={`${textSize} text-gray-500`}>{getActionText()}</span>
              </>
            ) : (
              <>
                <a href="#" className={`${textSize} font-semibold text-gray-900 hover:text-orange-500 transition-colors duration-200`}>
                  {actor.fullName}
                </a>
                <span className={`${textSize} text-gray-500`}>{getActionText()}</span>
              </>
            )}
            <span className="text-gray-400">·</span>
            <button className={`${textSize} text-gray-400 hover:text-gray-600 transition-colors duration-200`}>
              {formatTimestamp(timestamp)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 