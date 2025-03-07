'use client';

import { FC } from 'react';
import { Content, FeedActionType, Post } from '@/types/feed';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp } from '@/utils/date';
import { formatRSC } from '@/utils/number';
import { AuthorProfile } from '@/types/authorProfile';

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
  size = 'sm',
}) => {
  const getActionText = () => {
    switch (content.type) {
      case 'bounty':
        if (content.bountyType === 'review') {
          return `${action}ed a peer review bounty for ${formatRSC({ amount: content.amount, shorten: true })} RSC`;
        } else if (content.bountyType === 'answer') {
          return `${action}ed an answer bounty for ${formatRSC({ amount: content.amount, shorten: true })} RSC`;
        } else {
          return `${action}ed a bounty for ${formatRSC({ amount: content.amount, shorten: true })} RSC`;
        }
      case 'paper':
        return `${action}ed a ${content.type.replace('_', ' ')}`;
      case 'post':
        const post = content as Post;
        return `${action}ed a ${post.postType}`;
      default:
        return action;
    }
  };

  const getAvatarItems = () => {
    switch (content.type) {
      case 'bounty':
      case 'post':
        return [
          {
            src: content.actor?.profileImage ?? '',
            alt: content.actor?.fullName ?? '',
            tooltip: content.actor?.fullName,
          },
        ];
      case 'paper':
        return content.authors.map((author: AuthorProfile) => ({
          src: author.profileImage ?? '',
          alt: author.fullName ?? '',
          tooltip: author.fullName,
        }));
      default:
        return [];
    }
  };

  const getAuthors = () => {
    switch (content.type) {
      case 'bounty':
      case 'post':
        return [
          {
            name: content.actor?.fullName ?? '',
            verified: content.actor?.user?.isVerified ?? false,
            profileUrl: content.actor?.profileUrl ?? '',
          },
        ];
      case 'paper':
        return content.authors.map((author: AuthorProfile) => ({
          name: author.fullName ?? '',
          verified: author.user?.isVerified ?? false,
          profileUrl: author.profileUrl ?? '',
        }));
      default:
        return [];
    }
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
            delimiter={<span className="text-gray-400">•</span>}
            delimiterClassName="text-gray-900"
          />
          <span className="text-sm text-gray-600">{getActionText()}</span>
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{formatTimestamp(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
