'use client';

<<<<<<< HEAD
import { FC } from 'react';
import { Content, FeedActionType, Post } from '@/types/feed';
=======
import { FC, ReactNode } from 'react';
import { Content, FeedActionType } from '@/types/feed';
>>>>>>> 94ba447 (Refactor bounty cards by decoupling from comment)
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorList } from '@/components/ui/AuthorList';
import { formatTimestamp, formatTimeAgo } from '@/utils/date';
import { formatRSC } from '@/utils/number';
import { AuthorProfile } from '@/types/authorProfile';
import { Avatar } from '@/components/ui/Avatar';
import { Star } from 'lucide-react';
import { cn } from '@/utils/styles';
import { CommentType } from '@/types/comment';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RSCBadge } from '@/components/ui/RSCBadge';

// Simple read-only stars component for displaying review score
const ReadOnlyStars = ({ rating }: { rating: number }) => {
  return (
    <div className="flex space-x-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
};

type ContentType = 'bounty' | 'paper' | 'post' | 'comment' | 'review' | 'answer' | string;

interface Author {
  id?: string | number;
  fullName: string;
  profileImage?: string | null;
  profileUrl?: string;
  isVerified?: boolean;
}

interface FeedItemHeaderProps {
  // Core props
  contentType: ContentType;
  timestamp: string | Date;
  className?: string;
  size?: 'xs' | 'sm' | 'md';

  // Author/contributor props
  author?: Author;
  authors?: Author[];

  // Action props
  action?: FeedActionType | string;
  actionText?: string;

  // Content-specific props
  score?: number;
  bountyAmount?: number;
  bountyStatus?: 'open' | 'closed' | 'expiring';

  // Additional elements
  rightElement?: ReactNode;
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({
  contentType,
  timestamp,
  className,
  size = 'sm',

  author,
  authors = [],

  action,
  actionText,

  score,
  bountyAmount,
  bountyStatus,

  rightElement,
}) => {
  // Combine single author with authors array if provided
  const allAuthors = author ? [author, ...authors] : authors;

  // Get the primary author (first in the list)
  const primaryAuthor = allAuthors.length > 0 ? allAuthors[0] : null;

  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp.toISOString() : timestamp;

  // Get default action text based on content type if not provided
  const getDefaultActionText = (): string => {
    if (actionText) return actionText;

    if (action) {
      switch (contentType) {
        case 'bounty':
          return `${action}ed a bounty${bountyAmount ? ` for ${formatRSC({ amount: bountyAmount, shorten: true })} RSC` : ''}`;
        case 'paper':
        case 'post':
          return `${action}ed a ${contentType.replace('_', ' ')}`;
        case 'comment':
          return `${action}ed`;
        case 'review':
          return `peer reviewed`;
        case 'answer':
          return `answered`;
        default:
          return `${action}ed`;
      }
    }

    // Fallbacks if no action provided
    switch (contentType) {
      case 'bounty':
<<<<<<< HEAD
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
=======
        return 'opened bounty';
      case 'review':
        return 'peer reviewed';
      case 'answer':
        return 'answered';
      case 'comment':
>>>>>>> 94ba447 (Refactor bounty cards by decoupling from comment)
      default:
        return 'commented';
    }
  };

  // Determine if we should show the review stars
  const shouldShowReviewStars = contentType === 'review' && typeof score === 'number' && score > 0;

  // Get the number of additional authors
  const additionalAuthorsCount = allAuthors.length - 1;

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        {/* Always show a single avatar for the primary author */}
        <Avatar
          src={primaryAuthor?.profileImage || ''}
          alt={primaryAuthor?.fullName || 'Unknown'}
          size={size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm'}
        />

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            {/* Show primary author name */}
            {primaryAuthor && (
              <a
                href={primaryAuthor.profileUrl || '#'}
                className="font-semibold hover:text-indigo-600"
              >
                {primaryAuthor.fullName}
                {primaryAuthor.isVerified && (
                  <span className="inline-block ml-1 text-blue-500">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-3.5 h-3.5 inline-block -mt-0.5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </a>
            )}

            <span className="text-gray-400">•</span>
            <span className="text-gray-600">{getDefaultActionText()}</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-500">{formatTimeAgo(formattedDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Show review stars if applicable */}
        {shouldShowReviewStars && <ReadOnlyStars rating={score!} />}

        {/* Custom right element if provided */}
        {rightElement}
      </div>
    </div>
  );
};
