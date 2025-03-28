'use client';

import { FC, useEffect } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { navigateToAuthorProfile } from '@/utils/navigation';

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

  // Add debug logging to check author data
  useEffect(() => {
    if (author) {
      console.log('FeedItemHeader author:', author);
      console.log('Author id available:', author.id);
    }
  }, [author]);

  // Determine avatar size based on the size prop
  const avatarSize = size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm';
  const avatarStackSize = avatarSize === 'xs' ? 'xxs' : avatarSize === 'md' ? 'md' : 'sm';

  // Determine if we have author ID to show tooltip
  const authorId = author?.id;

  // For bounty header format
  if (isBounty && author) {
    // Create combined list of avatars starting with author
    const allParticipants = [
      {
        profileImage: author.profileImage || '',
        fullName: author.fullName || 'Author',
        profileUrl: author.profileUrl,
        authorId: authorId,
      },
      ...contributors,
    ];

    // Calculate the total number of people involved
    const totalPeople =
      totalContributorsCount !== undefined
        ? totalContributorsCount + 1 // +1 for the author
        : allParticipants.length;

    // Number of visible avatars in the stack
    const MAX_VISIBLE_AVATARS = 3;

    // Convert participants to AvatarStack format
    const allAvatarItems = allParticipants.map((person) => ({
      src: person.profileImage || '',
      alt: person.fullName || 'Participant',
      tooltip: person.fullName,
      authorId: person.authorId,
    }));

    // Take the first N avatars for the stack (including author)
    const visibleAvatarItems = allAvatarItems.slice(0, MAX_VISIBLE_AVATARS);

    // Create the title text with tooltip for author name
    const contributorsText =
      totalPeople > 1 ? (
        <span>
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <span
                className="text-gray-900 font-semibold cursor-pointer hover:text-indigo-600"
                onClick={() => navigateToAuthorProfile(authorId)}
              >
                {author.fullName}
              </span>
            </AuthorTooltip>
          ) : (
            <span className="text-gray-900 font-semibold">{author.fullName}</span>
          )}
          <span className="text-gray-900 font-semibold">
            {` and ${totalPeople - 1} ${totalPeople === 2 ? 'other' : 'others'} `}
          </span>
          <span className="text-gray-600">{actionText}</span>
        </span>
      ) : (
        <span>
          {authorId ? (
            <AuthorTooltip authorId={authorId}>
              <span
                className="text-gray-900 font-semibold cursor-pointer hover:text-indigo-600"
                onClick={() => navigateToAuthorProfile(authorId)}
              >
                {author.fullName}
              </span>
            </AuthorTooltip>
          ) : (
            <span className="text-gray-900 font-semibold">{author.fullName}</span>
          )}
          {` `}
          <span className="text-gray-600">{actionText}</span>
        </span>
      );

    return (
      <div className={cn('flex items-center justify-between w-full', className)}>
        <div className="flex items-center gap-3">
          {/* Show avatars with +N indicator for extras */}
          <AvatarStack
            items={visibleAvatarItems}
            allItems={allAvatarItems}
            size={avatarStackSize}
            maxItems={MAX_VISIBLE_AVATARS}
            spacing={-8}
            ringColorClass="ring-white"
            disableTooltip={false}
            showExtraCount={true}
            totalItemsCount={totalPeople}
            extraCountLabel="Other Contributors"
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-[15px]">
              <span className="text-gray-900">{contributorsText}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500">
                {formattedDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <span className="text-gray-500">
              {formattedDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
