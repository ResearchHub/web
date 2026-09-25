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
  getContribution,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
  isProposalSubmission,
  type ActivityHeaderMessage,
} from '../lib/activityDisplay.utils';
import { getActivityBounty, shouldShowAuthorBadge } from '../lib/activityWork.utils';
import type { FeedEntry } from '@/types/feed';
import type { AuthorProfile } from '@/types/authorProfile';
import { cn } from '@/utils/styles';

interface ActivityCardHeaderProps {
  entry: FeedEntry;
  /**
   * Built by the caller, which alone knows whose profile the row sits on and how
   * many entries it speaks for.
   */
  message: ActivityHeaderMessage;
  authors?: AuthorProfile[];
}

export const ActivityCardHeader: FC<ActivityCardHeaderProps> = ({ entry, message, authors }) => {
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const reviewEarning = getReviewEarning(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const bounty = entry.activityAction === 'bounty_opened' ? getActivityBounty(entry) : undefined;

  const hasAmount = Boolean(
    grantAmount || contribution || reviewEarning || bounty || reviewScore != null
  );
  // Who the proposer is matters on their own submission; elsewhere the actor is
  // acting on someone else's work and the headline is just noise.
  const headline = isProposalSubmission(entry) ? message.actor.headline?.trim() : undefined;

  return (
    <div className={cn('min-w-0 pt-1 text-sm leading-6', !authors && 'mb-2.5')}>
      <ActivityHeaderActionText
        message={message}
        authors={authors}
        isAuthor={shouldShowAuthorBadge(entry, message.actor.id)}
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
      {headline && (
        <span className="block truncate text-xs leading-4 text-gray-500">{headline}</span>
      )}
    </div>
  );
};
