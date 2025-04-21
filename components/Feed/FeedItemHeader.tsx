'use client';

import { FC, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatTimeAgo } from '@/utils/date';

interface Contributor {
  profileImage?: string;
  fullName?: string;
  profileUrl?: string;
  authorId?: number;
}

interface FeedItemHeaderProps {
  timestamp: string | Date;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  author?: AuthorProfile;
  actionText?: string;
  contributors?: Contributor[];
  contributorsLabel?: string;
  isBounty?: boolean;
  totalContributorsCount?: number;
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({
  timestamp,
  className,
  size = 'sm',
  author,
  actionText,
  contributors = [],
  contributorsLabel = 'Contributors',
  isBounty = false,
  totalContributorsCount,
}) => {
  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Determine avatar size based on the size prop
  const avatarSize = size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm';
  const avatarStackSize = avatarSize === 'xs' ? 'xxs' : avatarSize === 'md' ? 'md' : 'sm';

  // Determine if we have author ID to show tooltip
  const authorId = author?.id;

  // Standard header format (non-bounty)
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={author?.profileImage ?? ''}
          alt={author?.fullName ?? 'Unknown'}
          size={avatarSize}
          className={authorId ? 'cursor-pointer' : ''}
          onClick={authorId ? () => navigateToAuthorProfile(authorId) : undefined}
          authorId={authorId}
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            {author ? (
              authorId ? (
                <AuthorTooltip authorId={authorId}>
                  <a
                    href="#"
                    className="font-semibold hover:text-indigo-600 cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      navigateToAuthorProfile(authorId);
                    }}
                  >
                    {author.fullName}
                  </a>
                </AuthorTooltip>
              ) : (
                <span className="font-semibold">{author.fullName}</span>
              )
            ) : null}

            <span className="text-gray-600">{actionText}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{formatTimeAgo(formattedDate.toISOString())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
