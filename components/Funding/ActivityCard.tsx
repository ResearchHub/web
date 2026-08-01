'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { ActivityHeaderActionText } from '@/components/Activity/ActivityHeaderActionText';
import { BountyAmount } from '@/components/Activity/BountyAmount';
import { ContributionAmount } from '@/components/Activity/ContributionAmount';
import { FeedEntryIcon } from '@/components/Activity/FeedEntryIcon';
import { GrantFundingAmount } from '@/components/Activity/GrantFundingAmount';
import { ReviewScoreStars } from '@/components/Activity/ReviewScoreStars';
import {
  getActionIcon,
  getActivityHeaderMessage,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from '@/components/Activity/lib/feedEntryAdapters';
import { getActivityBounty } from '@/components/Activity/lib/activityWorkContext';
import { formatTimeAgo } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardProps {
  entry: FeedEntry;
}

/** Compact activity row used in the funding sidebar. */
export const ActivityCard: FC<ActivityCardProps> = ({ entry }) => {
  const { title, href } = getEntryMeta(entry);

  if (!title) return null;

  const message = getActivityHeaderMessage(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const reviewEarning = getReviewEarning(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const bounty = entry.activityContext === 'bounty_opened' ? getActivityBounty(entry) : undefined;

  const hasAmount = Boolean(
    grantAmount || contribution || reviewEarning || bounty || reviewScore != null
  );

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
        <div className="row-span-2 pt-0.5">
          <AuthorTooltip authorId={message.actor.id} placement="bottom">
            <Avatar
              src={message.actor.profileImage}
              alt={message.actor.fullName || 'User'}
              size={32}
              authorId={message.actor.id}
              disableTooltip
            />
          </AuthorTooltip>
        </div>
        <span className="mb-1 text-sm leading-6">
          <ActivityHeaderActionText message={message} />
          {grantAmount && (
            <>
              {' '}
              <GrantFundingAmount amount={grantAmount} className="align-middle" />
            </>
          )}
          {contribution && (
            <>
              {' '}
              <ContributionAmount
                contribution={contribution}
                showSign={!message.isEarning}
                className="align-middle"
              />
            </>
          )}
          {reviewEarning && (
            <>
              {' '}
              <ContributionAmount
                contribution={reviewEarning}
                showSign={false}
                className="align-middle"
              />
            </>
          )}
          {bounty && (
            <>
              {' '}
              <BountyAmount bounty={bounty} className="align-middle" />
            </>
          )}
          {reviewScore != null && reviewScore > 0 && (
            <>
              {' '}
              <ReviewScoreStars score={reviewScore} size="sm" className="align-middle" />
            </>
          )}
          <FeedEntryIcon name={hasAmount ? null : actionIcon} />
        </span>
        <span className="text-sm leading-tight line-clamp-2">{titleEl}</span>
      </div>
      <Tooltip content={new Date(entry.timestamp).toLocaleString()}>
        <span className="block text-xs text-gray-400 mt-1 ml-[42px] cursor-default w-fit">
          {formatTimeAgo(entry.timestamp)}
        </span>
      </Tooltip>
    </div>
  );
};
