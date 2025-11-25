'use client';

import { FC } from 'react';
import {
  FeedEntry,
  FeedApplicationContent,
  FeedPostContent,
  FeedContentType,
  Review,
} from '@/types/feed';
import { UserVoteType } from '@/types/reaction';
import { FeedItemFundraise } from './FeedItemFundraise';
import { ContentType } from '@/types/work';
import { ExtendedContentMetrics } from '@/components/Feed/FeedItemActions';
import { Tip } from '@/types/tip';
import { Bounty } from '@/types/bounty';

interface FeedItemApplicationProps {
  entry: FeedEntry;
  metrics?: Partial<ExtendedContentMetrics>;
  feedContentType: FeedContentType;
  votableEntityId: number;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  userVote?: UserVoteType;
  href?: string;
  reviews?: Review[];
  bounties?: Bounty[];
  tips?: Tip[];
  awardedBountyAmount?: number;
}

export const FeedItemApplication: FC<FeedItemApplicationProps> = ({
  entry,
  metrics,
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
  userVote,
  href,
  reviews,
  bounties,
  tips,
  awardedBountyAmount,
}) => {
  const applicationContent = entry.content as FeedApplicationContent;
  const { createdBy, createdDate, applicationDetails, preregistration } = applicationContent;

  // Convert preregistration to FeedEntry format for FeedItemFundraise
  const preregistrationFeedEntry: FeedEntry = {
    id: preregistration.id.toString(),
    recommendationId: entry.recommendationId,
    timestamp: createdDate,
    action: 'publish' as const,
    contentType: 'PREREGISTRATION' as const,
    content: {
      ...preregistration,
      createdBy: createdBy,
      createdDate: createdDate,
      contentType: 'PREREGISTRATION' as const,
      textPreview: preregistration.textPreview || '',
      authors: preregistration.authors || [],
      topics: preregistration.topics || [],
      institution: applicationDetails.institution,
      reviews: reviews || [],
      bounties: bounties || [],
    } as FeedPostContent,
    metrics: {
      votes: metrics?.votes || 0,
      comments: metrics?.comments || 0,
      saves: 0,
    },
    userVote: userVote,
    raw: entry.raw,
  };

  return (
    <div className="space-y-3">
      <FeedItemFundraise
        entry={preregistrationFeedEntry}
        href={href}
        showTooltips={true}
        showActions={true}
        customActionText="applied to RFP"
      />
    </div>
  );
};
