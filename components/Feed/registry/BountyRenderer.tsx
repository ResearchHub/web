import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import Link from 'next/link';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ExpandableContent } from '../shared';
import { ArrowUp, MessageCircle, Edit2, Trash2, Flag } from 'lucide-react';
import { Work } from '@/types/work';
import { AuthorList } from '@/components/ui/AuthorList';
import { ActionButton } from '../ActionButton';
import { RelatedWorkCard } from '@/components/Paper/RelatedWorkCard';

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
 * Extract author data from a contribution
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

    // Debug log to help diagnose issues
    console.log('BountyRenderer contributors:', {
      bountyId: bounty.id,
      hasContributions,
      contributionsCount: bounty.contributions?.length || 0,
      displayContributorsCount: displayContributors.length,
    });

    // Prepare contributors for display
    const contributorsForDisplay =
      displayContributors.length > 0
        ? displayContributors
        : hasContributions
          ? bounty.contributions.map((contribution) => ({
              profile: {
                fullName:
                  contribution.createdBy.authorProfile?.fullName ||
                  (contribution.raw?.created_by?.author_profile
                    ? `${contribution.raw.created_by.author_profile.first_name || ''} ${contribution.raw.created_by.author_profile.last_name || ''}`.trim()
                    : 'Unknown'),
                profileImage:
                  contribution.createdBy.authorProfile?.profileImage ||
                  contribution.raw?.created_by?.author_profile?.profile_image ||
                  undefined,
              },
              amount: Number(contribution.amount),
            }))
          : [];

    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="w-full">
          {/* Line separator - only show if there's no related work */}
          {!context?.relatedWork && <div className="border-t border-gray-200 mb-4 w-full"></div>}

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
          />
        </div>

        {/* Contributors Button - positioned all the way to the right */}
        {hasContributions && contributorsForDisplay.length > 0 && (
          <div className="flex-shrink-0">
            <ContributorsButton contributors={contributorsForDisplay} onContribute={onContribute} />
          </div>
        )}
      </div>
    );
  },

  /**
   * Render footer actions that appear at the bottom of every card
   * (e.g., "Upvote", "Reply", "Share" for all content types)
   */
  renderFooterActions: (bounty, options = {}) => {
    const {
      showActions = true,
      onUpvote,
      onReply,
      onEdit,
      onDelete,
      onReport,
      isAuthor = false,
    } = options;

    if (!showActions) return null;

    return (
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <ActionButton
            icon={ArrowUp}
            tooltip="Upvote"
            label="Upvote"
            onClick={() => onUpvote && onUpvote(bounty.id)}
            showLabel={true}
          />

          <ActionButton
            icon={MessageCircle}
            tooltip="Comment"
            label="Comment"
            onClick={() => onReply && onReply(bounty.id)}
            showLabel={true}
          />

          {isAuthor && onEdit && (
            <ActionButton
              icon={Edit2}
              tooltip="Edit"
              label="Edit"
              onClick={() => onEdit(bounty.id)}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthor && onDelete && (
            <ActionButton
              icon={Trash2}
              tooltip="Delete"
              label="Delete"
              onClick={() => onDelete(bounty.id)}
              className="text-gray-500"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onReport && onReport(bounty.id)}
            className="text-gray-500"
            tooltip="Flag"
          >
            <Flag className="w-5 h-5 text-gray-800" strokeWidth={2} />
            <span className="sr-only">Flag</span>
          </Button>
        </div>
      </div>
    );
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
