'use client';

import { FC } from 'react';
import { FeedEntry, FeedBountyContent } from '@/types/feed';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { BountyActionRow } from '@/components/Bounty/BountyActionRow';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { calculateTotalAwardedAmount, isOpenBounty } from '@/components/Bounty/lib/bountyUtil';
import { ContentFormat } from '@/types/comment';
import { ID } from '@/types/root';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyType } from '@/types/bounty';
import { BaseFeedItem, TitleSection, PrimaryActionSection } from '@/components/Feed/BaseFeedItem';
import { Avatar } from '@/components/ui/Avatar';
import { AuthorTooltip } from '@/components/ui/AuthorTooltip';
import Link from 'next/link';

/**
 * Internal component for rendering bounty details
 */
export const BountyDetails: FC<{
  content: any;
  contentFormat: ContentFormat | undefined;
  bountyType: BountyType;
  maxLength?: number;
  href?: string;
  onFeedItemClick?: () => void;
}> = ({ content, contentFormat, bountyType, maxLength, href, onFeedItemClick }) => {
  if (!content || Object.keys(content).length === 0) {
    return null;
  }

  return (
    <div>
      <TitleSection
        title={bountyType === 'REVIEW' ? 'Peer Review Earning Opportunity' : 'Earning Opportunity'}
        className="text-md"
        href={href}
        onClick={onFeedItemClick}
      />
      <div className="text-gray-600 mt-2">
        <CommentReadOnly content={content} contentFormat={contentFormat} maxLength={maxLength} />
      </div>
    </div>
  );
};

interface FeedItemBountyCommentProps {
  entry: FeedEntry;
  showSolutions?: boolean;
  showRelatedWork?: boolean;
  relatedDocumentId?: number;
  href?: string; // Optional href prop
  showTooltips?: boolean; // Property for controlling tooltips
  showContributeButton?: boolean; // Property for controlling the visibility of the contribute button
  onViewSolution?: (event: {
    solutionId: number;
    authorName: string;
    awardedAmount?: string;
  }) => void;
  onAward?: (bountyId: number) => void; // Prop for Award action, passes bounty ID
  onEdit?: () => void; // Prop for Edit action
  onReply?: () => void; // Prop for Reply action
  onContributeSuccess?: () => void; // Prop for handling successful contribution
  isAuthor?: boolean; // Prop to determine if current user is the author
  canAwardBounty?: boolean; // Foundation account or moderator can award bounties
  showCreatorActions?: boolean; // Prop to determine whether to show creator actions
  actionLabels?: {
    upvote?: string;
    comment?: string;
  }; // Prop for customizing action labels
  showFooter?: boolean; // Prop to control footer visibility
  hideActions?: boolean; // Prop to hide actions, similar to FeedItemComment
  showSupportAndCTAButtons?: boolean; // Show container for Support and CTA buttons
  showDeadline?: boolean; // Show deadline in metadata line
  maxLength?: number;
  onFeedItemClick?: () => void;
}

/**
 * Main component for rendering a bounty feed item
 */
export const FeedItemBountyComment: FC<FeedItemBountyCommentProps> = ({
  entry,
  relatedDocumentId,
  showSolutions = true,
  showRelatedWork = true,
  href,
  showTooltips = true, // Default to showing tooltips
  showContributeButton = false,
  onViewSolution,
  onAward,
  onEdit,
  onReply,
  onContributeSuccess,
  isAuthor = false,
  canAwardBounty = false,
  showCreatorActions = true, // Default to showing creator actions
  actionLabels,
  showFooter = true, // Default to showing the footer
  hideActions = false, // Prop to hide actions, similar to FeedItemComment
  showSupportAndCTAButtons = true, // Show container for Support and CTA buttons
  showDeadline = true, // Show deadline in metadata line
  maxLength,
  onFeedItemClick,
}) => {
  // Extract the bounty entry from the entry's content
  const bountyEntry = entry.content as FeedBountyContent;
  const bounty = bountyEntry.bounty;

  // Determine bounty status
  const isOpen = isOpenBounty(bounty);
  const solutionsCount = bounty.solutions ? bounty.solutions.length : 0;
  const hasSolutions = solutionsCount > 0;

  const creatorProfile = bounty.createdBy?.authorProfile;
  const rawCreatedBy = bounty.raw?.created_by;
  const bountyCreator = creatorProfile
    ? {
        id: creatorProfile.id,
        fullName: creatorProfile.fullName,
        profileImage: creatorProfile.profileImage,
        profileUrl: creatorProfile.profileUrl,
      }
    : rawCreatedBy?.id
      ? {
          id: rawCreatedBy.id,
          fullName:
            bounty.createdBy?.fullName ||
            `${rawCreatedBy.first_name || ''} ${rawCreatedBy.last_name || ''}`.trim() ||
            'Unknown',
          profileImage: rawCreatedBy.profile_image || '',
          profileUrl: `/author/${rawCreatedBy.id}`,
        }
      : bounty.createdBy?.id
        ? {
            id: bounty.createdBy.id,
            fullName: bounty.createdBy.fullName,
            profileImage: '',
            profileUrl: `/author/${bounty.createdBy.id}`,
          }
        : undefined;

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    if (onViewSolution) {
      onViewSolution({
        solutionId: typeof solutionId === 'number' ? solutionId : Number(solutionId),
        authorName,
        awardedAmount,
      });
    }
  };

  return (
    <div className="space-y-3">
      <BaseFeedItem
        entry={entry}
        href={href}
        showHeader={false}
        showActions={false}
        onFeedItemClick={onFeedItemClick}
      >
        {entry.relatedWork && showRelatedWork && (
          <div
            className="mt-4"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <RelatedWorkCard size="sm" work={entry.relatedWork} onFeedItemClick={onFeedItemClick} />
          </div>
        )}

        <div>
          <TitleSection
            title={
              bounty.bountyType === 'REVIEW'
                ? 'Peer Review Earning Opportunity'
                : 'Earning Opportunity'
            }
            className="text-md"
            href={href}
            onClick={onFeedItemClick}
          />
          {bountyCreator && (
            <div className="flex items-center gap-2.5 mt-3">
              <AuthorTooltip authorId={bountyCreator.id !== 0 ? bountyCreator.id : undefined}>
                <Avatar
                  src={bountyCreator.profileImage || undefined}
                  alt={bountyCreator.fullName}
                  size="sm"
                  disableTooltip
                />
              </AuthorTooltip>
              <div className="flex flex-col min-w-0">
                <Link
                  href={bountyCreator.profileUrl || '#'}
                  className="text-sm font-medium text-gray-900 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {bountyCreator.fullName}
                </Link>
                <span className="text-xs text-gray-500">Offering bounty</span>
              </div>
            </div>
          )}
          <div className="text-gray-600 mt-2">
            <CommentReadOnly
              content={bountyEntry.comment.content}
              contentFormat={bountyEntry.comment.contentFormat}
              maxLength={maxLength}
            />
          </div>
        </div>

        {!isOpen && hasSolutions && showSolutions && (
          <div
            className="mt-4"
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <BountySolutions
              solutions={bounty.solutions}
              isPeerReviewBounty={bounty.bountyType === 'REVIEW'}
              totalAwardedAmount={calculateTotalAwardedAmount(bounty)}
              onViewSolution={handleViewSolution}
            />
          </div>
        )}

        {showSupportAndCTAButtons && (
          <PrimaryActionSection>
            <BountyActionRow
              bounty={bounty}
              commentId={bountyEntry.comment.id}
              relatedWork={entry.relatedWork}
              relatedDocumentId={bountyEntry.relatedDocumentId}
              relatedDocumentContentType={bountyEntry.relatedDocumentContentType}
              canAward={showCreatorActions && canAwardBounty}
              onAward={onAward}
              isAuthor={isAuthor}
              showContributeButton={showContributeButton}
              onContributeSuccess={onContributeSuccess}
            />
          </PrimaryActionSection>
        )}
      </BaseFeedItem>
    </div>
  );
};
