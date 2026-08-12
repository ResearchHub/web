'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { ActivityHeaderActionText } from './ActivityHeaderActionText';
import { BountyAmount } from './BountyAmount';
import { ContributionAmount } from './ContributionAmount';
import { FeedEntryIcon } from './FeedEntryIcon';
import { GrantFundingAmount } from './GrantFundingAmount';
import { ReviewScoreStars } from './ReviewScoreStars';
import {
  getActionIcon,
  getActivityHeaderMessage,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from './lib/feedEntryDisplay';
import { getActivityBounty } from './lib/activityWorkContext';
import { formatTimeAgo } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardCompactProps {
  entry: FeedEntry;
}

/** Compact activity row used in the activity sidebar. */
export const ActivityCardCompact: FC<ActivityCardCompactProps> = ({ entry }) => {
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
          <Avatar
            src={message.actor.profileImage}
            alt={message.actor.fullName || 'User'}
            size={32}
            authorId={message.actor.id}
          />
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
