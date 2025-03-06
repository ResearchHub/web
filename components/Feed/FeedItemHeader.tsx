'use client';

import { FC } from 'react';
import { Content } from '@/types/feed';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp } from '@/utils/date';
import { formatRSC } from '@/utils/number';
import { AuthorProfile } from '@/types/authorProfile';

// Define the action type
export type FeedActionType = 'publish' | 'repost' | 'comment' | 'vote' | string;

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
        return `${action}ed a bounty for ${formatRSC({ amount: content.amount || 0, shorten: true })} RSC`;
      case 'paper':
      case 'post':
        return `${action}ed a ${content.type.replace('_', ' ')}`;
      case 'funding_request':
        return `${action}ed a funding request for ${formatRSC({ amount: content.amount || 0, shorten: true })} RSC`;
      default:
        return action;
    }
  };

  const getAvatarItems = () => {
    switch (content.type) {
      case 'bounty':
      case 'post':
      case 'funding_request':
        return [
          {
            src: content.actor?.profileImage ?? '',
            alt: content.actor?.fullName ?? '',
            tooltip: content.actor?.fullName,
          },
        ];
      case 'paper':
        return (
          content.authors?.map((author: AuthorProfile) => ({
            src: author.profileImage ?? '',
            alt: author.fullName ?? '',
            tooltip: author.fullName,
          })) || []
        );
      default:
        return [];
    }
  };

  const getAuthors = () => {
    switch (content.type) {
      case 'bounty':
      case 'post':
      case 'funding_request':
        return [
          {
            name: content.actor?.fullName ?? '',
            verified: content.actor?.user?.isVerified ?? false,
            profileUrl: content.actor?.profileUrl ?? '',
          },
        ];
      case 'paper':
        return (
          content.authors?.map((author: AuthorProfile) => ({
            name: author.fullName ?? '',
            verified: author.user?.isVerified ?? false,
            profileUrl: author.profileUrl ?? '',
          })) || []
        );
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
