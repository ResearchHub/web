'use client';

import { FC } from 'react';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import type { ActivityWork } from '../lib/activityWork.utils';
import type { FeedContentType, FeedEntry } from '@/types/feed';

interface ActivityWorkActionsProps {
  entry: FeedEntry;
  work: ActivityWork;
}

function getFeedContentTypeForWork(work: ActivityWork): FeedContentType {
  if (work.documentType === 'paper') return 'PAPER';
  if (work.documentType === 'preregistration') return 'PREREGISTRATION';
  if (work.documentType === 'funding_request') return 'GRANT';
  return 'POST';
}

/**
 * Footer actions for an activity work card: votes on the left, utility actions and
 * the flag menu on the right, matching the action bar on the rest of the feed cards.
 */
export const ActivityWorkActions: FC<ActivityWorkActionsProps> = ({ entry, work }) => {
  const voteCount = entry.metrics?.adjustedScore ?? entry.metrics?.votes ?? 0;

  return (
    <FeedItemActions
      metrics={{ votes: voteCount, adjustedScore: voteCount }}
      feedContentType={getFeedContentTypeForWork(work)}
      votableEntityId={work.id}
      relatedDocumentId={work.id.toString()}
      relatedDocumentContentType={work.documentType}
      relatedDocumentUnifiedDocumentId={work.unifiedDocumentId?.toString()}
      feedEntryId={entry.id}
      userVote={entry.userVote}
      href={work.href}
      actionLabels={{ report: 'Flag Content' }}
      hideCommentButton
    />
  );
};
