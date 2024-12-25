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


  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <AvatarStack
          items={content.type === 'paper' && content.participants?.role === 'author' 
            ? [
                {
                  src: content.actor.profileImage,
                  alt: content.actor.fullName,
                  tooltip: content.actor.fullName
                },
                ...content.participants.profiles
                  .filter(profile => profile.id !== content.actor.id)
                  .map(profile => ({
                    src: profile.profileImage,
                    alt: profile.fullName,
                    tooltip: profile.fullName
                  }))
              ]
            : [{
                src: content.actor.profileImage,
                alt: content.actor.fullName,
                tooltip: content.actor.fullName
              }]
          }
          size={size}
          maxItems={content.type === 'paper' ? 3 : 1}
          spacing={-12}
        />
        
        <div className="flex flex-wrap items-center gap-1.5 -mt-1">
          {content.type === 'paper' && content.participants?.role === 'author' ? (
            <AuthorList
              authors={[
                {
                  name: content.actor.fullName,
                  verified: content.actor.user?.isVerified,
                  profileUrl: content.actor.profileUrl
                },
                ...content.participants.profiles
                  .filter(profile => profile.id !== content.actor.id)
                  .map(profile => ({
                    name: profile.fullName,
                    verified: profile.user?.isVerified,
                    profileUrl: profile.profileUrl
                  }))
              ]}
              size="sm"
              className="font-semibold"
              delimiter="and"
              delimiterClassName="text-gray-900"
            />
          ) : (
            <AuthorList
              authors={[{
                name: content.actor.fullName,
                verified: content.actor.user?.isVerified,
                profileUrl: content.actor.profileUrl
              }]}
              size="sm"
              className="font-semibold"
              delimiter="and"
              delimiterClassName="text-gray-900"
            />
          )}
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