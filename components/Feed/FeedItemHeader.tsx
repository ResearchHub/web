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
import { formatTimestamp } from '@/utils/date';
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

  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Determine if we should show multiple authors or just one
  const showMultipleAuthors = allAuthors.length > 1;

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

  // Get avatar items for AvatarStack
  const getAvatarItems = () => {
    return allAuthors
      .map((author) => ({
        src: author.profileImage ?? '',
        alt: author.fullName ?? '',
        tooltip: author.fullName,
      }))
      .filter((item) => !!item.src); // Filter out items with empty src
  };

  // Get authors for AuthorList
  const getAuthorsForList = () => {
    return allAuthors.map((author) => ({
      name: author.fullName ?? '',
      verified: author.isVerified ?? false,
      profileUrl: author.profileUrl ?? '',
    }));
  };

  // Determine if we should show the review stars
  const shouldShowReviewStars = contentType === 'review' && typeof score === 'number' && score > 0;

  // Determine if we should show bounty metadata
  const shouldShowBountyMetadata = contentType === 'bounty' && (bountyAmount || bountyStatus);

  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        {showMultipleAuthors ? (
          <AvatarStack
            items={getAvatarItems()}
            size={size}
            maxItems={contentType === 'paper' ? 3 : allAuthors.length > 3 ? 3 : allAuthors.length}
            spacing={-12}
          />
        ) : allAuthors.length === 1 ? (
          <Avatar
            src={allAuthors[0].profileImage ?? ''}
            alt={allAuthors[0].fullName}
            size={size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm'}
          />
        ) : (
          // Fallback avatar if no authors
          <Avatar src="" alt="Unknown" size={size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm'} />
        )}

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-[15px]">
            {showMultipleAuthors ? (
              <AuthorList
                authors={getAuthorsForList()}
                size={size === 'xs' ? 'xs' : 'sm'}
                className="font-semibold"
                delimiter={<span className="text-gray-400">•</span>}
                delimiterClassName="text-gray-900"
              />
            ) : allAuthors.length === 1 ? (
              <a href={allAuthors[0].profileUrl} className="font-semibold hover:text-indigo-600">
                {allAuthors[0].fullName}
              </a>
            ) : null}

            <span className="text-gray-600">{getDefaultActionText()}</span>
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

      <div className="flex items-center gap-2">
        {/* Show review stars if applicable */}
        {shouldShowReviewStars && <ReadOnlyStars rating={score!} />}

        {/* Show bounty metadata if applicable */}
        {shouldShowBountyMetadata && (
          <div className="flex items-center gap-2">
            {bountyStatus && (
              <StatusBadge status={bountyStatus} className="shadow-sm rounded-full" size="xs" />
            )}
            {bountyAmount && (
              <RSCBadge
                amount={bountyAmount}
                inverted={true}
                variant="badge"
                className="shadow-sm rounded-full h-[26px] flex items-center"
                size="xs"
              />
            )}
          </div>
        )}

        {/* Custom right element if provided */}
        {rightElement}
      </div>
    </div>
  );
};
