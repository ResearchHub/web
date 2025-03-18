'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';

interface Contributor {
  profileImage?: string;
  fullName?: string;
  profileUrl?: string;
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

  // For bounty header format
  if (isBounty && author) {
    // Create combined list of avatars starting with author
    const allParticipants = [
      {
        profileImage: author.profileImage || '',
        fullName: author.fullName || 'Author',
        profileUrl: author.profileUrl,
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
    }));

    // Take the first N avatars for the stack (including author)
    const visibleAvatarItems = allAvatarItems.slice(0, MAX_VISIBLE_AVATARS);

    // Create the title text
    const contributorsText =
      totalPeople > 1 ? (
        <span>
          <span className="text-gray-900 font-semibold">
            {author.fullName} and {totalPeople - 1} {totalPeople === 2 ? 'other' : 'others'}
            {` `}
          </span>
          <span className="text-gray-600">{actionText}</span>
        </span>
      ) : (
        <span>
          <span className="text-gray-900 font-semibold">
            {author.fullName}
            {` `}
          </span>
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
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            {author ? (
              <a href={author.profileUrl} className="font-semibold hover:text-indigo-600">
                {author.fullName}
              </a>
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
