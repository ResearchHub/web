'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatTimeAgo } from '@/utils/date';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Tooltip } from '@/components/ui/Tooltip';
import { EditorBadge } from '@/components/ui/EditorBadge';
import { AuthorBadge } from '@/components/ui/AuthorBadge';
import { Work } from '@/types/work';
import { TrendingUp } from 'lucide-react';
import { ImpactScoreTooltip } from '@/components/tooltips/ImpactScoreTooltip';
import { HotScoreBreakdownModal } from '@/components/modals/HotScoreBreakdownModal';
import { User } from '@/types/user';
import { ExternalMetrics, HotScoreBreakdown } from '@/types/feed';

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
  user?: User; // Direct user object for verified badge
  authors?: Array<{ name: string }>; // New prop for multiple authors
  actionText?: string;
  source?: string; // Source name (e.g., "bioRxiv")
  onSourceClick?: (source: string) => void; // Handler for source click
  contributors?: Contributor[];
  contributorsLabel?: string;
  isBounty?: boolean;
  totalContributorsCount?: number;
  work?: Work;
  hideAuthorBadge?: boolean;
  impactScore?: number | null;
  citations?: number;
  twitterMentions?: number;
  newsMentions?: number;
  altmetricScore?: number | null;
  hotScoreV2?: number;
  hotScoreBreakdown?: HotScoreBreakdown;
  externalMetrics?: ExternalMetrics;
}

export const FeedItemHeader: FC<FeedItemHeaderProps> = ({
  timestamp,
  className,
  size = 'sm',
  author,
  user,
  authors,
  actionText,
  source,
  onSourceClick,
  contributors = [],
  contributorsLabel = 'Contributors',
  isBounty = false,
  totalContributorsCount,
  work,
  hideAuthorBadge = false,
  impactScore,
  citations = 0,
  twitterMentions = 0,
  newsMentions = 0,
  altmetricScore,
  hotScoreV2,
  hotScoreBreakdown,
  externalMetrics,
}) => {
  // Format date consistently
  const formattedDate = timestamp instanceof Date ? timestamp : new Date(timestamp);

  // Determine avatar size based on the size prop
  const avatarSize = size === 'xs' ? 'xs' : size === 'md' ? 'md' : 'sm';

  // Handle multiple authors if provided
  let displayAuthor = author;
  if (!displayAuthor && authors && authors.length > 0) {
    const authorName = authors.length === 1 ? authors[0].name : `${authors[0].name} et al.`;

    displayAuthor = {
      id: 0,
      fullName: authorName,
      firstName: '',
      lastName: '',
      profileImage: '',
      profileUrl: '',
      isClaimed: false,
      isVerified: false,
    };
  }

  // Determine if we have author ID to show tooltip
  const authorId = displayAuthor?.id;
  // Check if author is an editor of any hub
  const isEditor = displayAuthor?.editorOfHubs && displayAuthor.editorOfHubs.length > 0;

  // Check if author is also an author of the work
  const isAuthorOfWork = work?.authors?.some((a) => a.authorProfile.id === authorId);

  // Standard header format (non-bounty)
  return (
    <div className={cn('flex items-center justify-between w-full', className)}>
      <div className="flex items-center gap-3">
        <Avatar
          src={displayAuthor?.profileImage ?? ''}
          alt={displayAuthor?.fullName ?? 'Unknown'}
          size={avatarSize}
          className={authorId && authorId > 0 ? 'cursor-pointer' : ''}
          authorId={authorId}
        />

        <div className="flex flex-col">
          <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm md:!text-[15px]">
            {displayAuthor ? (
              <div className="flex items-center gap-1">
                {authorId && authorId > 0 ? (
                  <AuthorTooltip authorId={authorId}>
                    <Link
                      href={`/author/${authorId}`}
                      className="font-semibold hover:text-blue-600 cursor-pointer"
                    >
                      {displayAuthor.fullName}
                    </Link>
                  </AuthorTooltip>
                ) : (
                  <span className="font-semibold">{displayAuthor.fullName}</span>
                )}
                {/* Show verified badge if user is verified - check both direct user prop and author */}
                {(user?.isVerified ||
                  displayAuthor?.isVerified ||
                  displayAuthor?.user?.isVerified) && (
                  <VerifiedBadge size="sm" showTooltip={true} />
                )}
                {/* Show AuthorBadge with priority over EditorBadge - only if not hidden */}
                {!hideAuthorBadge && isAuthorOfWork && (
                  <div className="flex items-center px-1">
                    <AuthorBadge size={size === 'xs' ? 'sm' : 'md'} />
                  </div>
                )}
                {/* Only show EditorBadge if not an author of the work and not hidden */}
                {!hideAuthorBadge && isEditor && !isAuthorOfWork && (
                  <div className="flex items-center px-1">
                    <EditorBadge hubs={displayAuthor.editorOfHubs} size={'md'} />
                  </div>
                )}
              </div>
            ) : null}

            {/* Render action text with clickable source if provided */}
            {source && onSourceClick && actionText?.includes(source) ? (
              <>
                <span className="text-gray-600">
                  {actionText.split(source)[0]}
                  <button
                    onClick={() => onSourceClick(source)}
                    className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    {source}
                  </button>
                  {actionText.split(source)[1]}
                </span>
              </>
            ) : (
              <span className="text-gray-600">{actionText}</span>
            )}

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
