'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Avatar } from '@/components/ui/Avatar';
import { ActivityHeaderActionText } from './ActivityHeaderActionText';
import { ActivityActionIcon } from '../lib/ActivityActionIcon';
import { BountyAmount } from '../amounts/BountyAmount';
import { ContributionAmount } from '../amounts/ContributionAmount';
import { GrantFundingAmount } from '../amounts/GrantFundingAmount';
import { ReviewScoreStars } from '../amounts/ReviewScoreStars';
import {
  getActionIcon,
  getActivityHeaderMessage,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from '../lib/activityDisplay.utils';
import { getActivityBounty, isActivityWorkAuthor } from '../lib/activityWork.utils';
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
  const bounty = entry.activityAction === 'bounty_opened' ? getActivityBounty(entry) : undefined;

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

  const trailing = (
    <>
      {grantAmount && (
        <>
          {' '}
          <GrantFundingAmount amount={grantAmount} size="sm" className="align-middle" />
        </>
      )}
      {contribution && (
        <>
          {' '}
          <ContributionAmount
            contribution={contribution}
            showSign={!message.isEarning}
            size="sm"
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
            size="sm"
            className="align-middle"
          />
        </>
      )}
      {bounty && (
        <>
          {' '}
          <BountyAmount bounty={bounty} size="sm" className="align-middle" />
        </>
      )}
      {reviewScore != null && reviewScore > 0 && (
        <>
          {' '}
          <ReviewScoreStars score={reviewScore} size="sm" className="align-middle" />
        </>
      )}
      <ActivityActionIcon name={hasAmount ? null : actionIcon} />
    </>
  );

  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <div className="flex gap-2.5 items-start">
        <div className="flex-shrink-0 pt-0.5">
          <Avatar
            src={message.actor.profileImage}
            alt={message.actor.fullName || 'User'}
            size={32}
            authorId={message.actor.id}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ActivityHeaderActionText
            message={message}
            stacked
            trailing={trailing}
            className="text-sm leading-5"
            isAuthor={isActivityWorkAuthor(entry, message.actor.id)}
          />
          <span className="mt-1 block text-sm leading-tight line-clamp-2">{titleEl}</span>
          <Tooltip content={new Date(entry.timestamp).toLocaleString()}>
            <span className="mt-1 block w-fit cursor-default text-xs text-gray-400">
              {formatTimeAgo(entry.timestamp)}
            </span>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
