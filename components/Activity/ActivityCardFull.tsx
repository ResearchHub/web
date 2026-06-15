'use client';

import { FC } from 'react';
import { ActivityCardHeader } from './ActivityCardHeader';
import { ActivityWorkPanel } from './ActivityWorkPanel';
import { ActivityFundraiseSlot } from './slots/ActivityFundraiseSlot';
import { ActivityBountySlot } from './slots/ActivityBountySlot';
import { ActivityGrantSlot } from './slots/ActivityGrantSlot';
import { ActivityCommentSlot } from './slots/ActivityCommentSlot';
import { getCommentPreview, getReviewScore } from './lib/feedEntryAdapters';
import {
  getActivityWorkContext,
  resolveActivityBodySlot,
  shouldShowActivityComment,
  type ActivityBodySlot,
} from './lib/activityWorkContext';
import type { FeedCommentContent, FeedEntry } from '@/types/feed';

interface ActivityCardFullProps {
  entry: FeedEntry;
}

function ActivityBodySlot({
  slot,
  work,
  reviewScore,
  commentPreview,
}: {
  slot: ActivityBodySlot;
  work: ReturnType<typeof getActivityWorkContext>;
  reviewScore?: number;
  commentPreview: ReturnType<typeof getCommentPreview>;
}) {
  if (!work) return null;

  switch (slot) {
    case 'fundraise':
      return <ActivityFundraiseSlot work={work} reviewScore={reviewScore} />;
    case 'bounty':
      return (
        <ActivityBountySlot
          work={work}
          bountyDetails={
            commentPreview
              ? { content: commentPreview.content, format: commentPreview.format }
              : undefined
          }
        />
      );
    case 'grant':
      return <ActivityGrantSlot work={work} />;
    default:
      return null;
  }
}

export const ActivityCardFull: FC<ActivityCardFullProps> = ({ entry }) => {
  const work = getActivityWorkContext(entry);

  if (!work) return null;

  const commentPreview = getCommentPreview(entry);
  const reviewScore =
    getReviewScore(entry) ?? entry.metrics?.reviewScore ?? work.fundraise?.reviewMetrics?.avg;

  const slot = resolveActivityBodySlot(entry.activityContext, work, {
    isReview: commentPreview?.isReview,
  });
  const effectiveSlot: ActivityBodySlot =
    slot === 'fundraise' && !work.fundraise
      ? 'default'
      : slot === 'grant' && !work.grant
        ? 'default'
        : slot === 'bounty' && !work.bounty
          ? 'default'
          : slot;

  const commentEntry =
    entry.contentType === 'COMMENT' ? (entry.content as FeedCommentContent) : undefined;

  const showCommentSlot = shouldShowActivityComment(effectiveSlot, commentPreview);

  const fundraiseSlotReviewScore =
    effectiveSlot === 'fundraise' && showCommentSlot ? undefined : reviewScore;

  return (
    <article className="py-5">
      <ActivityCardHeader entry={entry} />
      <ActivityWorkPanel work={work}>
        <ActivityBodySlot
          slot={effectiveSlot}
          work={work}
          reviewScore={fundraiseSlotReviewScore}
          commentPreview={commentPreview}
        />
        {showCommentSlot && commentPreview && (
          <ActivityCommentSlot
            commentPreview={commentPreview}
            isReview={commentPreview.isReview}
            reviewScore={getReviewScore(entry) ?? entry.metrics?.reviewScore}
            workTitle={work.title}
            workHref={work.href}
            createdDate={commentEntry?.createdDate}
            updatedDate={commentEntry?.updatedDate}
          />
        )}
      </ActivityWorkPanel>
    </article>
  );
};
