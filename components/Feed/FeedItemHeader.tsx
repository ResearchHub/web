'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';

interface FeedItemHeaderProps {
  timestamp: string | Date;
  className?: string;
  size?: 'xs' | 'sm' | 'md';
  author?: AuthorProfile;
  actionText?: string;
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({
  timestamp,
  className,
  size = 'sm',
  author,
  actionText,
}) => {
  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={author?.profileImage ?? ''}
          alt={author?.fullName ?? 'Unknown'}
          size={size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm'}
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
