'use client';

import { FC } from 'react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { ActivityHeaderActionText } from '@/components/Activity/cards/ActivityHeaderActionText';
import { ActivityActionIcon } from '@/components/Activity/lib/ActivityActionIcon';
import { BountyAmount } from '@/components/Activity/amounts/BountyAmount';
import { ContributionAmount } from '@/components/Activity/amounts/ContributionAmount';
import { GrantFundingAmount } from '@/components/Activity/amounts/GrantFundingAmount';
import { ReviewScoreStars } from '@/components/Activity/amounts/ReviewScoreStars';
import {
  getActionIcon,
  getActivityHeaderMessage,
  getCommentPreview,
  getContribution,
  getEntryMeta,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from '@/components/Activity/lib/activityDisplay.utils';
import { getActivityBounty, shouldShowAuthorBadge } from '@/components/Activity/lib/activityWork.utils';
import { Avatar } from '@/components/ui/Avatar';
import { formatTimeAgo } from '@/utils/date';
import { cn } from '@/utils/styles';
import type { FeedEntry } from '@/types/feed';

const PREVIEW_MAX_LENGTH = 120;

interface FeedEntryPickerRowProps {
  entry: FeedEntry;
  selected: boolean;
  onSelect: () => void;
}

export const FeedEntryPickerRow: FC<FeedEntryPickerRowProps> = ({ entry, selected, onSelect }) => {
  const { title } = getEntryMeta(entry);
  const message = getActivityHeaderMessage(entry);
  const commentPreview = getCommentPreview(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const reviewEarning = getReviewEarning(entry);
  const grantAmount = getGrantAmount(entry);
  const contribution = getContribution(entry);
  const bounty = entry.activityAction === 'bounty_opened' ? getActivityBounty(entry) : undefined;

  const hasAmount = Boolean(
    grantAmount || contribution || reviewEarning || bounty || reviewScore != null
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
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
        selected ? 'border-primary-500 bg-primary-50/40' : 'border-gray-200 hover:border-gray-300'
      )}
    >
      <input
        type="radio"
        name={`feed-entry-picker-${entry.id}`}
        checked={selected}
        onChange={onSelect}
        className="mt-1 h-4 w-4 shrink-0 accent-primary-600"
      />
      <div className="min-w-0 flex-1">
        <div className="flex gap-2.5">
          <Avatar
            src={message.actor.profileImage}
            alt={message.actor.fullName || 'User'}
            size={32}
            authorId={message.actor.id}
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <ActivityHeaderActionText
              message={message}
              stacked
              trailing={trailing}
              className="text-sm leading-5"
              isAuthor={shouldShowAuthorBadge(entry, message.actor.id)}
            />
            {title && (
              <p className="mt-1 line-clamp-1 text-sm text-gray-700">{title}</p>
            )}
            {commentPreview && (
              <div className="mt-2 text-sm text-gray-600">
                <CommentReadOnly
                  content={commentPreview.content}
                  contentFormat={commentPreview.format}
                  maxLength={PREVIEW_MAX_LENGTH}
                  showReadMoreButton={false}
                  showLinkPreviews={false}
                />
              </div>
            )}
            <span className="mt-1 block text-xs text-gray-400">
              {formatTimeAgo(entry.timestamp)}
            </span>
          </div>
        </div>
      </div>
    </label>
  );
};
