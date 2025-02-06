'use client';

import { FC } from 'react';
import { Content, FeedActionType } from '@/types/feed';
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
    switch (action) {
      case 'publish':
        return `published a ${content.type.replace('_', ' ')}`;
      default:
        return action;
    }
  };

  const getAvatarItems = () => {
    if (content.type === 'paper') {
      return content.authors.map((author: AuthorProfile) => ({
        src: author.profileImage,
        alt: author.fullName,
        tooltip: author.fullName,
      }));
    }

    return [];
  };

  const getAuthors = () => {
    if (content.type === 'paper') {
      return content.authors.map((author: AuthorProfile) => ({
        name: author.fullName,
        verified: author.user?.isVerified,
        profileUrl: author.profileUrl,
      }));
    }

    return [];
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
          {action === 'contribute' && content.type === 'contribution' ? (
            <>
              <span className="text-sm text-gray-600">
                contributed {formatRSC({ amount: content.amount })} RSC towards bounty
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-600">{getActionText()}</span>
          )}
          <span className="text-sm text-gray-400">•</span>
          <span className="text-sm text-gray-400">{formatTimestamp(timestamp)}</span>
        </div>
      </div>
    </div>
  );
};
