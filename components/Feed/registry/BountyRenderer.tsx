import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import Link from 'next/link';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ExpandableContent } from '../shared';
import { ArrowUp, MessageCircle, Edit2, Trash2, Flag, MoreVertical } from 'lucide-react';
import { Work, ContentType } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { ActionButton } from '../ActionButton';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { UpvoteAndCommentButton } from '@/components/ui/UpvoteAndCommentButton';

// Import specialized Bounty components
import { BountyDetails } from '@/components/Bounty/BountyDetails';
import { BountyMetadataLine } from '@/components/Bounty/BountyMetadataLine';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { BountyActions } from '@/components/Bounty/BountyActions';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import {
  calculateTotalAwardedAmount,
  extractContributors,
  filterOutCreator,
  isExpiringSoon,
  extractContributorsForDisplay,
} from '@/components/Bounty/lib/bountyUtil';

/**
 * Format currency for display
 */
const formatCurrency = (amount: number | string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return `$${numericAmount.toFixed(2)}`;
};

/**
 * Extract author data from a bounty
 */
const extractAuthorData = (bounty: Bounty): AuthorData => {
  return {
    id: bounty.createdBy.id,
    fullName: bounty.createdBy.authorProfile?.fullName || 'Unknown',
    profileImage: bounty.createdBy.authorProfile?.profileImage || null,
    profileUrl: bounty.createdBy.authorProfile?.profileUrl || '#',
    isVerified: bounty.createdBy.authorProfile?.user?.isVerified,
  };
};

/**
 * Extract contributor data from a contribution
 */
const extractContributorData = (contribution: BountyContribution): AuthorData => {
  return {
    id: contribution.createdBy.id,
    fullName: contribution.createdBy.authorProfile?.fullName || 'Unknown',
    profileImage: contribution.createdBy.authorProfile?.profileImage || null,
    profileUrl: contribution.createdBy.authorProfile?.profileUrl || '#',
    isVerified: contribution.createdBy.authorProfile?.user?.isVerified,
  };
};

/**
 * Renderer for bounty content
 */
export const BountyRenderer: ContentRenderer<Bounty> = {
  renderHeader: (bounty, options = {}) => {
    const authorData = BountyRenderer.getAuthorData(bounty);
    const metadata = BountyRenderer.getMetadata(bounty);

    // Determine bounty status
    const isActive = bounty.status === 'OPEN';
    const isExpiring = isActive && isExpiringSoon(bounty.expirationDate);
    const bountyStatus = isExpiring ? 'expiring' : isActive ? 'open' : 'closed';

    // Ensure authorData is of the correct type
    const author = Array.isArray(authorData) ? authorData[0] : authorData;

    return (
      <FeedItemHeader
        contentType="bounty"
        timestamp={bounty.raw?.created_date}
        author={author}
        bountyAmount={parseFloat(bounty.amount)}
        bountyStatus={bountyStatus}
      />
    );
  },

  renderBody: (bounty, options = {}) => {
    const { isExpanded, onToggleExpand, context } = options;

    // Create badges
    const badges = [];

    // Add solutions badge if there are any
    if (bounty.solutions && bounty.solutions.length > 0) {
      badges.push(
        <div
          key="solutions"
          className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {bounty.solutions.length} Solution
          {bounty.solutions.length !== 1 ? 's' : ''}
        </div>
      );
    }

    // Get the description from the bounty or context, or use default based on bounty type
    let description = context?.commentContent || bounty.raw?.description || '';
    const contentFormat = context?.commentContentFormat || 'text';

    // If no description is provided, use default based on bounty type
    if (!description) {
      if (bounty.bountyType === 'REVIEW') {
        description = 'Please provide a peer review of this paper';
      } else {
        description = 'No information provided';
      }
    }

    // Determine bounty status
    const isOpen = bounty.status === 'OPEN';
    const expiringSoon = isExpiringSoon(bounty.expirationDate);

    // Calculate total awarded amount for solutions
    const totalAwardedAmount = calculateTotalAwardedAmount(bounty);

    // Check if this is a peer review bounty
    const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

    // Check if there are solutions
    const hasSolutions = !isOpen && bounty.solutions && bounty.solutions.length > 0;

    // Check if there's a related work
    const relatedWork = context?.relatedWork;
    const handleRelatedWorkClick = context?.onRelatedWorkClick;

    // Get contributors for display using the helper function
    const displayContributors = extractContributorsForDisplay(bounty);

    // Get upvote and comment counts
    const upvoteCount = (bounty as any).upvoteCount || 0;
    const commentCount = (bounty as any).commentCount || 0;

    // Prepare contributors for display
    const contributorsForDisplay =
      displayContributors.length > 0
        ? displayContributors
        : hasSolutions
          ? bounty.solutions.map((solution) => ({
              profile: {
                fullName: solution.createdBy.authorProfile?.fullName || 'Unknown',
                profileImage: solution.createdBy.authorProfile?.profileImage || undefined,
              },
              amount: Number(solution.awardedAmount || 0),
            }))
          : [];

    return (
      <div className="space-y-4">
        {/* Metadata Line with bounty type, deadline, and amount */}
        <BountyMetadataLine
          bountyType={bounty.bountyType}
          amount={parseFloat(bounty.totalAmount)}
          expirationDate={bounty.expirationDate}
          isOpen={isOpen}
          expiringSoon={expiringSoon}
        />

        {/* Additional badges if any */}
        {badges.length > 0 && <div className="flex flex-wrap gap-2 mt-3">{badges}</div>}

        {/* Details section with bounty content - always show, using default content if needed */}
        <div className="mt-4">
          <BountyDetails content={description} contentFormat={contentFormat} />
        </div>

        {/* Related Work - show if available */}
        {relatedWork && (
          <div className="mt-4">
            <RelatedWorkCard work={relatedWork} onClick={handleRelatedWorkClick} />
          </div>
        )}

        {/* Solutions section for closed bounties */}
        {!isOpen && hasSolutions && (
          <div className="mt-4">
            <BountySolutions
              solutions={bounty.solutions}
              isPeerReviewBounty={isPeerReviewBounty}
              totalAwardedAmount={totalAwardedAmount}
              onViewSolution={(solutionId, authorName, awardedAmount) => {
                if (options.onViewSolution) {
                  options.onViewSolution(solutionId, authorName, awardedAmount);
                }
              }}
            />
          </div>
        )}
      </div>
    );
  },

  /**
   * Render content-specific actions that appear within the body
   * (e.g., "Contribute", "Submit Solution" for bounties)
   */
  renderContentActions: (bounty, options = {}) => {
    const isOpen = bounty.status === 'OPEN';
    const {
      onContribute,
      onViewSolution,
      onNavigationClick,
      isAuthor = false,
      context = {},
      onUpvote,
      onReply,
      onEdit,
      onDelete,
      onReport,
      isUpvoted = false,
      useFooterActions = false,
      documentId,
      contentType = 'paper',
      entityId,
      userVote,
      score,
    } = options;
    const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

    // Get related work from context
    const relatedWork = context?.relatedWork;

    // Get contributors for display using the helper function
    const displayContributors = extractContributorsForDisplay(bounty);

    // If the bounty is closed and has solutions, we'll show them in the body
    if (!isOpen && bounty.solutions && bounty.solutions.length > 0) {
      return null; // Solutions are rendered in the body
    }

    // Check if we have contributions to display
    const hasContributions = bounty.contributions && bounty.contributions.length > 0;

    // Get upvote and comment counts
    const upvoteCount = (bounty as any).upvoteCount || 0;
    const commentCount = (bounty as any).commentCount || 0;

    // If using footer actions, only render the content-specific actions
    if (useFooterActions) {
      return (
        <div className="mt-4 flex items-center justify-between">
          <div className="w-full">
            {/* Line separator - only show if there's no related work */}
            {!context?.relatedWork && <div className="border-t border-gray-200 mb-4 w-full"></div>}

            {/* Bounty Actions */}
            <div className="flex items-center justify-between">
              <BountyActions
                isOpen={isOpen}
                isCreator={isAuthor}
                isPeerReviewBounty={isPeerReviewBounty}
                onAwardClick={() => {
                  if (options.onAward) {
                    options.onAward(bounty.id);
                  }
                }}
                onNavigationClick={(tab) => {
                  if (onNavigationClick) {
                    onNavigationClick(tab);
                  }
                }}
                onContributeClick={() => {
                  if (onContribute) {
                    onContribute();
                  }
                }}
                onUpvote={() => {
                  if (onUpvote && entityId !== undefined) {
                    onUpvote(entityId);
                  }
                }}
                onComment={() => {
                  if (onReply && entityId !== undefined) {
                    onReply(entityId);
                  }
                }}
                isUpvoted={isUpvoted}
                upvoteCount={upvoteCount}
                commentCount={commentCount}
                contributors={displayContributors}
                votableEntityId={entityId !== undefined ? entityId : undefined}
                documentId={entityId !== undefined ? entityId : undefined}
                contentType="discussion"
                userVote={userVote}
                score={score}
              />

              {/* Right side actions */}
              <div className="flex items-center gap-3">
                {/* Three dots menu with flag option - positioned right after the actions */}
                <BaseMenu
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 p-1 h-8 w-8 rounded-full"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  }
                >
                  <BaseMenuItem
                    onClick={() => {
                      if (onReport) {
                        onReport(bounty.id);
                      }
                    }}
                  >
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </BaseMenuItem>
                </BaseMenu>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If not using footer actions, include all actions (including the three dots menu)
    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="w-full">
          {/* Line separator - only show if there's no related work */}
          {!context?.relatedWork && <div className="border-t border-gray-200 mb-4 w-full"></div>}

          {/* Bounty Actions with three dots menu */}
          <div className="flex items-center justify-between">
            <BountyActions
              isOpen={isOpen}
              isCreator={isAuthor}
              isPeerReviewBounty={isPeerReviewBounty}
              onAwardClick={() => {
                if (options.onAward) {
                  options.onAward(bounty.id);
                }
              }}
              onNavigationClick={(tab) => {
                if (onNavigationClick) {
                  onNavigationClick(tab);
                }
              }}
              onContributeClick={() => {
                if (onContribute) {
                  onContribute();
                }
              }}
              onUpvote={() => {
                if (onUpvote && entityId !== undefined) {
                  onUpvote(entityId);
                }
              }}
              onComment={() => {
                if (onReply && entityId !== undefined) {
                  onReply(entityId);
                }
              }}
              isUpvoted={isUpvoted}
              upvoteCount={upvoteCount}
              commentCount={commentCount}
              contributors={displayContributors}
              votableEntityId={entityId !== undefined ? entityId : undefined}
              documentId={entityId !== undefined ? entityId : undefined}
              contentType="discussion"
              userVote={userVote}
              score={score}
            />

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Three dots menu with flag option - positioned right after the actions */}
              <BaseMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 p-1 h-8 w-8 rounded-full"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                }
              >
                <BaseMenuItem
                  onClick={() => {
                    if (onReport) {
                      onReport(bounty.id);
                    }
                  }}
                >
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </BaseMenuItem>
              </BaseMenu>
            </div>
          </div>
        </div>
      </div>
    );
  },

  /**
   * Render footer actions that appear at the bottom of every card
   * This is now used when useFooterActions is true
   */
  renderFooterActions: (bounty, options = {}) => {
    const { useFooterActions = false } = options;

    // Return null if not using footer actions
    if (!useFooterActions) return null;

    // Implement footer actions if needed
    return null;
  },

  getUrl: (bounty) => {
    // Construct URL based on bounty data
    return `/bounty/${bounty.id}`;
  },

  getAuthorData: (bounty) => {
    return extractAuthorData(bounty);
  },

  getMetadata: (bounty) => {
    // Determine the bounty status
    const isActive = bounty.status === 'OPEN';
    const isExpiring = isActive && isExpiringSoon(bounty.expirationDate);
    const bountyStatus = isExpiring ? 'expiring' : isActive ? 'open' : 'closed';

    // Get paper information if available
    const paperTitle = bounty.raw?.paper?.title;
    const paperSlug = bounty.raw?.paper?.slug;

    return {
      timestamp: bounty.raw?.created_date,
      type: 'bounty',
      amount: bounty.amount,
      totalAmount: bounty.totalAmount,
      bountyStatus,
      expirationDate: bounty.expirationDate,
      bountyType: bounty.bountyType,
      solutionsCount: bounty.solutions.length,
      contributionsCount: bounty.contributions.length,
      // Include paper information if this bounty is for a paper
      paperTitle,
      paperSlug,
    };
  },
};
