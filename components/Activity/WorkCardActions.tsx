'use client';

import { FC, ReactNode } from 'react';
import { FeedItemActions } from '@/components/Feed/FeedItemActions';
import type { UserVoteType } from '@/types/reaction';
import type { FeedContentType } from '@/types/feed';
import type { ActivityWorkContext } from './lib/activityWorkContext';

interface WorkCardActionsProps {
  work: ActivityWorkContext;
  voteCount: number;
  userVote?: UserVoteType;
  cta?: ReactNode;
}

function toFeedContentType(documentType: ActivityWorkContext['documentType']): FeedContentType {
  return documentType === 'paper' ? 'PAPER' : 'POST';
}

export const WorkCardActions: FC<WorkCardActionsProps> = ({ work, voteCount, userVote, cta }) => (
  <FeedItemActions
    metrics={{ votes: voteCount, adjustedScore: voteCount }}
    feedContentType={toFeedContentType(work.documentType)}
    votableEntityId={work.id}
    relatedDocumentId={work.id.toString()}
    relatedDocumentContentType={work.documentType}
    relatedDocumentUnifiedDocumentId={work.unifiedDocumentId?.toString()}
    userVote={userVote}
    href={work.href}
    hideCommentButton
    hideReportButton
    variant="inline"
    leadingUtilityActions
    rightSideActionButton={cta}
    className="gap-1"
  />
);
