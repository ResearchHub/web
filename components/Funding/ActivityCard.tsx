'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { formatTimeAgo } from '@/utils/date';
import type { FeedEntry } from '@/types/feed';
import {
  getActionIcon,
  getActionLabel,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewScore,
} from '@/components/Activity/lib/feedEntryAdapters';
import { ContributionAmount } from '@/components/Activity/ContributionAmount';
import { FeedEntryIcon } from '@/components/Activity/FeedEntryIcon';
import { GrantFundingAmount } from '@/components/Activity/GrantFundingAmount';

interface ActivityCardProps {
  entry: FeedEntry;
}

export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const { title, author, href } = getEntryMeta(entry);

  if (!title) return null;

  const actionLabel = getActionLabel(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);

  const titleEl = href ? (
    <Link href={href} className="text-primary-600 hover:text-primary-800">
      {title}
    </Link>
  ) : (
    <span className="text-gray-500">{title}</span>
  );

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="grid grid-cols-[auto_1fr] gap-x-2.5 items-start">
        <div className="row-span-3 pt-0.5">
          <AuthorTooltip authorId={author?.id} placement="bottom">
            <Avatar
              src={author?.profileImage}
              alt={author?.fullName || 'User'}
              size={32}
              authorId={author?.id}
              disableTooltip
            />
          </AuthorTooltip>
        </div>
        <span className="text-sm font-medium text-gray-900 leading-tight truncate">
          {author?.fullName || 'Unknown'}
        </span>
        <span className="text-sm leading-tight mb-1">
          <span className="text-gray-500">{actionLabel}</span>
          <FeedEntryIcon name={actionIcon} />
          {reviewScore != null && (
            <span className="inline-flex items-center gap-1 ml-1.5 text-xs text-gray-600 align-middle">
              <Star size={13} className="fill-amber-400 text-amber-400" />
              {reviewScore.toFixed(1)}
            </span>
          )}
          {grantAmount && <GrantFundingAmount amount={grantAmount} className="ml-1.5" />}
          {contribution && (
            <ContributionAmount contribution={contribution} className="ml-1.5 text-green-700" />
          )}
        </span>
        <span className="text-sm leading-tight line-clamp-2">{titleEl}</span>
      </div>
      <span className="block text-xs text-gray-400 mt-1 ml-[42px]">
        {formatTimeAgo(entry.timestamp)}
      </span>
    </div>
  );
};
