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
  getFundraiseFullyFundedAmount,
  getGrantAmount,
  getReviewEarning,
  getReviewScore,
} from '../lib/activityDisplay.utils';
import {
  getActivityBounty,
  getActivityWork,
  shouldShowAuthorBadge,
} from '../lib/activityWork.utils';
import { formatTimeAgo, formatTimeAgoShort } from '@/utils/date';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';
import type { FeedEntry } from '@/types/feed';
import { ID } from '@/types/root';

interface ActivityCardCompactProps {
  entry: FeedEntry;
  currentDocumentId?: ID;
  /**
   * The whole row links to what the entry is about, with a hover state, in place
   * of the title link under the action. The author's name and photo keep their
   * own links.
   */
  rowLink?: boolean;
}

function isEntryAboutDocument(entry: FeedEntry, documentId: ID): boolean {
  const targetId = Number(documentId);
  if (!Number.isFinite(targetId)) return false;

  const work = getActivityWork(entry);
  if (work?.id != null && Number(work.id) === targetId) return true;

  if (entry.relatedWork?.id != null && Number(entry.relatedWork.id) === targetId) return true;

  const contentId = entry.content?.id;
  return contentId != null && Number(contentId) === targetId;
}

/** Compact activity row used in the activity sidebar. */
export const ActivityCardCompact: FC<ActivityCardCompactProps> = ({
  entry,
  currentDocumentId,
  rowLink = false,
}) => {
  const { title, href } = getEntryMeta(entry);

  if (!title) return null;

  // The whole row links to the entry when asked and the entry has a page.
  const rowHref = rowLink ? href : undefined;
  const isRowLink = Boolean(rowHref);
  /** A linked row needs no title link, nor does an entry about this very page. */
  const hideTitle =
    isRowLink || (currentDocumentId != null && isEntryAboutDocument(entry, currentDocumentId));

  const message = getActivityHeaderMessage(entry);
  const actionIcon = getActionIcon(entry);
  const reviewScore = getReviewScore(entry);
  const reviewEarning = getReviewEarning(entry);
  const grantAmount = getGrantAmount(entry);
  const fullyFundedAmount = getFundraiseFullyFundedAmount(entry);
  const contribution = getContribution(entry);
  const bounty = entry.activityAction === 'bounty_opened' ? getActivityBounty(entry) : undefined;

  const hasAmount = Boolean(
    grantAmount ||
    fullyFundedAmount ||
    contribution ||
    reviewEarning ||
    bounty ||
    reviewScore != null
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
      {fullyFundedAmount && (
        <>
          {' '}
          <ContributionAmount
            contribution={fullyFundedAmount}
            showSign={false}
            size="sm"
            className="align-middle"
          />
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
          <ReviewScoreStars
            score={reviewScore}
            size="sm"
            compact={isRowLink}
            className="align-middle"
          />
        </>
      )}
      <ActivityActionIcon name={hasAmount ? null : actionIcon} />
    </>
  );

  return (
    <div
      className={cn(
        isRowLink
          ? 'group relative rounded-lg px-2 py-2 transition-colors hover:bg-gray-50'
          : 'py-3 first:pt-0 last:pb-0'
      )}
    >
      {/* A link laid over the whole row; the row's own links sit above it. */}
      {rowHref && (
        <Link href={rowHref} aria-label={title} className="absolute inset-0 rounded-lg" />
      )}
      <div
        className={cn(
          'flex gap-2.5 items-start',
          isRowLink && 'pointer-events-none relative [&_a]:pointer-events-auto'
        )}
      >
        <div className="flex-shrink-0 pt-0.5">
          <Avatar
            src={message.actor.profileImage}
            alt={message.actor.fullName || 'User'}
            size={isRowLink ? 28 : 32}
            authorId={message.actor.id}
          />
        </div>
        <div className="min-w-0 flex-1">
          <ActivityHeaderActionText
            message={message}
            stacked
            trailing={trailing}
            className={isRowLink ? 'text-[13px] leading-[18px]' : 'text-sm leading-5'}
            isAuthor={shouldShowAuthorBadge(entry, message.actor.id)}
            // A row link is one line shorter: its time sits at the right end of
            // the author's line.
            aside={
              isRowLink ? (
                <span
                  className="shrink-0 text-xs text-gray-400"
                  title={new Date(entry.timestamp).toLocaleString()}
                >
                  {formatTimeAgoShort(entry.timestamp)}
                </span>
              ) : undefined
            }
          />
          {!hideTitle && (
            <span className="mt-1 block text-sm leading-tight line-clamp-2">{titleEl}</span>
          )}
          {!isRowLink && (
            <Tooltip content={new Date(entry.timestamp).toLocaleString()}>
              <span className="mt-1 block w-fit cursor-default text-xs text-gray-400">
                {formatTimeAgo(entry.timestamp)}
              </span>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
