'use client';

import { FC } from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import { ActivityHeaderActionText } from './ActivityHeaderActionText';
import { ContributionAmount } from './ContributionAmount';
import { FeedEntryIcon } from './FeedEntryIcon';
import { GrantFundingAmount } from './GrantFundingAmount';
import { ReviewScoreStars } from './ReviewScoreStars';
import {
  getActionIcon,
  getActivityHeaderMessage,
  getContribution,
  getGrantAmount,
  getReviewScore,
} from './lib/feedEntryAdapters';
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
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);

  return (
    <div className="pb-3">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-tight">
        <AuthorTooltip authorId={message.actor.id} placement="bottom">
          <Avatar
            src={message.actor.profileImage}
            alt={message.actor.fullName || 'User'}
            size={32}
            authorId={message.actor.id}
            disableTooltip
            className="flex-shrink-0"
          />
        </AuthorTooltip>
        <ActivityHeaderActionText message={message} />
        <FeedEntryIcon name={actionIcon} />
        {reviewScore != null && reviewScore > 0 && (
          <ReviewScoreStars score={reviewScore} size="sm" />
        )}
        {grantAmount && <GrantFundingAmount amount={grantAmount} />}
        {contribution && (
          <ContributionAmount contribution={contribution} className="text-gray-900" />
        )}
        <Tooltip
          content={new Date(entry.timestamp).toLocaleString()}
          wrapperClassName="ml-auto flex-shrink-0"
        >
          <span className="text-xs text-gray-400 cursor-default">
            {formatTimeAgo(entry.timestamp)}
          </span>
        </Tooltip>
      </div>
    </div>
  );
};
