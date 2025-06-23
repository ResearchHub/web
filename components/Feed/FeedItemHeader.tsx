'use client';

import { FC, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { navigateToAuthorProfile } from '@/utils/navigation';
import { formatTimeAgo } from '@/utils/date';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { EditorBadge } from '@/components/ui/EditorBadge';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { Work } from '@/types/work';

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
  work?: Work;
  hideAuthorBadge?: boolean;
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
  work,
  hideAuthorBadge = false,
}) => {
  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Determine avatar size based on the size prop
  const avatarSize = size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm';
  const avatarStackSize = avatarSize === 'xs' ? 'xxs' : avatarSize === 'md' ? 'md' : 'sm';

  // Determine if we have author ID to show tooltip
  const authorId = author?.id;
  // Check if author is an editor of any hub
  const isEditor = author?.editorOfHubs && author.editorOfHubs.length > 0;

  // Check if author is also an author of the work
  const isAuthorOfWork = work?.authors?.some((a) => a.authorProfile.id === authorId);

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
          <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm md:!text-[15px]">
            {author ? (
              <div className="flex items-center gap-1">
                {authorId ? (
                  <AuthorTooltip authorId={authorId}>
                    <a
                      href="#"
                      className="font-semibold hover:text-blue-600 cursor-pointer"
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
                )}
                {author.user?.isVerified && <VerifiedBadge size="sm" />}
                {/* Show AuthorBadge with priority over EditorBadge - only if not hidden */}
                {!hideAuthorBadge && isAuthorOfWork && (
                  <div className="flex items-center px-1">
                    <AuthorBadge size={size === 'xs' ? 'sm' : 'md'} />
                  </div>
                )}
                {/* Only show EditorBadge if not an author of the work and not hidden */}
                {!hideAuthorBadge && isEditor && !isAuthorOfWork && (
                  <div className="flex items-center px-1">
                    <EditorBadge hubs={author.editorOfHubs} size={'md'} />
                  </div>
                )}
              </div>
            ) : null}

            <span className="text-gray-600">{actionText}</span>
            <span className="text-gray-400">•</span>
            <Tooltip content={formattedDate.toLocaleString()}>
              <span className="text-gray-500 cursor-default">
                {formatTimeAgo(formattedDate.toISOString())}
              </span>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  );
};
