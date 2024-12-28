'use client'

import { FC } from 'react';
import { Content, FeedActionType } from '@/types/feed';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp } from '@/utils/date';
import { RSCBadge } from '@/components/ui/RSCBadge';

interface FeedItemHeaderProps {
  action: FeedActionType;
  timestamp: string;
  content: Content;
  target?: Content;
  size?: 'xs' | 'sm';
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({ 
  action, 
  timestamp, 
  content,
  target,
  size = 'sm'
}) => {
  const getActionText = () => {
    switch (action) {
      case 'repost':
        return 'reposted';
      case 'contribute':
        return 'contributed';
      case 'publish':
        return `published ${content.type.replace('_', ' ')}`;
      case 'post':
        return content.type === 'comment' ? 'commented' : 'posted';
      default:
        return action;
    }
  };

  const getAvatarItems = () => {
    if (content.type === 'paper') {
      return [
        {
          src: content.actor.profileImage,
          alt: content.actor.fullName,
          tooltip: content.actor.fullName
        },
        ...content.authors
          .filter(author => author.id !== content.actor.id)
          .map(author => ({
            src: author.profileImage,
            alt: author.fullName,
            tooltip: author.fullName
          }))
      ];
    }
    
    return [{
      src: content.actor.profileImage,
      alt: content.actor.fullName,
      tooltip: content.actor.fullName
    }];
  };

  const getAuthors = () => {
    if (content.type === 'paper') {
      return [
        {
          name: content.actor.fullName,
          verified: content.actor.user?.isVerified,
          profileUrl: content.actor.profileUrl
        },
        ...content.authors
          .filter(author => author.id !== content.actor.id)
          .map(author => ({
            name: author.fullName,
            verified: author.user?.isVerified,
            profileUrl: author.profileUrl
          }))
      ];
    }

    return [{
      name: content.actor.fullName,
      verified: content.actor.user?.isVerified,
      profileUrl: content.actor.profileUrl
    }];
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <AvatarStack
          items={getAvatarItems()}
          size={size}
          maxItems={content.type === 'paper' ? 3 : 1}
          spacing={-12}
        />
        <div className="flex flex-wrap items-center gap-1.5 -mt-1">
          <AuthorList
            authors={getAuthors()}
            size="sm"
            className="font-semibold"
            delimiter="and"
            delimiterClassName="text-gray-900"
          />
          {action === 'contribute' && content.type === 'contribution' ? (
            <>
              <span className="text-sm text-gray-500">contributed</span>
              <RSCBadge 
                amount={content.amount} 
                variant="inline" 
                size="xs" 
                className="font-semibold"
                showText={true}
                showIcon={false}
              />
              <span className="text-sm text-gray-500">towards bounty</span>
            </>
          ) : (
            <span className="text-sm text-gray-500">{getActionText()}</span>
          )}
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">
            {formatTimestamp(timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}; 