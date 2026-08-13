'use client';

import { FC } from 'react';
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
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from '../lib/activityDisplay.utils';
import { getActivityBounty, isActivityWorkAuthor } from '../lib/activityWork.utils';
import { formatTimeAgo } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import type { FeedEntry } from '@/types/feed';

interface ActivityCardHeaderProps {
  entry: FeedEntry;
}

export const ActivityCardHeader: FC<ActivityCardHeaderProps> = ({ entry }) => {
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

  return (
    <div className="mb-2.5 flex items-start justify-between gap-2 pt-1 text-sm">
      <div className="min-w-0 flex-1 leading-6">
        <ActivityHeaderActionText
          message={message}
          isAuthor={isActivityWorkAuthor(entry, message.actor.id)}
        />
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
        {message.suffix && <span className="text-gray-500">{message.suffix}</span>}
        <ActivityActionIcon name={hasAmount ? null : actionIcon} />
      </div>

      <Tooltip
        content={new Date(entry.timestamp).toLocaleString()}
        wrapperClassName="flex-shrink-0"
      >
        <span className="text-xs leading-6 text-gray-400 cursor-default whitespace-nowrap">
          {formatTimeAgo(entry.timestamp)}
        </span>
      </Tooltip>
    </div>
  );
};
