'use client';

import { FC } from 'react';
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
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from './lib/feedEntryDisplay';
import { getActivityBounty } from './lib/activityWorkContext';
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
  const bounty = entry.activityContext === 'bounty_opened' ? getActivityBounty(entry) : undefined;

  const hasAmount = Boolean(
    grantAmount || contribution || reviewEarning || bounty || reviewScore != null
  );

  return (
    <div className="mb-2.5 flex items-start justify-between gap-2 pt-1 text-sm">
      <div className="min-w-0 flex-1 leading-6">
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
        {message.suffix && <span className="text-gray-500">{message.suffix}</span>}
        <FeedEntryIcon name={hasAmount ? null : actionIcon} />
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
