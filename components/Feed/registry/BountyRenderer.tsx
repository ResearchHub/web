import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import Link from 'next/link';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ExpandableContent } from '../shared';
import { ArrowUp, MessageCircle, Edit2, Trash2, Share } from 'lucide-react';

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
    // Extract author data
    const authorData = extractAuthorData(bounty);

    // Determine bounty status
    const expiringSoon = options.expiringSoon || false;
    const isOpen = bounty.status === 'OPEN';
    const bountyStatus = isOpen ? (expiringSoon ? 'expiring' : 'open') : 'closed';

    // Format the amount
    const formattedAmount = formatCurrency(bounty.totalAmount);

    return (
      <FeedItemHeader
        author={authorData}
        timestamp={bounty.raw?.created_date || new Date().toISOString()}
        contentType="bounty"
        bountyStatus={bountyStatus}
        bountyAmount={parseFloat(bounty.totalAmount)}
        action={isOpen ? 'opened' : 'awarded'}
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

    // Get the description from the bounty or context
    const description = context?.commentContent || bounty.raw?.description || '';
    const contentFormat = context?.commentContentFormat;

    // Determine bounty status
    const isOpen = bounty.status === 'OPEN';
    const expiringSoon = isExpiringSoon(bounty.expirationDate);

    // Calculate total awarded amount for solutions
    const totalAwardedAmount = calculateTotalAwardedAmount(bounty);

    // Check if this is a peer review bounty
    const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

    // Check if there are solutions
    const hasSolutions = !isOpen && bounty.solutions && bounty.solutions.length > 0;

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

        {/* Details section with bounty content */}
        {description && contentFormat && (
          <div className="mt-4">
            <BountyDetails content={description} contentFormat={contentFormat} />
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
    const { onContribute, onViewSolution, onNavigationClick, isAuthor = false } = options;
    const isPeerReviewBounty = bounty.bountyType === 'REVIEW';

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
      onShare,
      isAuthor = false,
    } = options;

    if (!showActions) return null;

    return (
      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => onUpvote && onUpvote(bounty.id)}
          >
            <ArrowUp className="h-4 w-4" />
            <span>Upvote</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => onReply && onReply(bounty.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Reply</span>
          </Button>

          {isAuthor && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => onEdit(bounty.id)}
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthor && onDelete && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-500"
              onClick={() => onDelete(bounty.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5 text-gray-500"
            onClick={() => onShare && onShare(bounty.id)}
          >
            <Share className="h-4 w-4" />
            <span className="sr-only">Share</span>
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
    return {
      amount: bounty.amount,
      totalAmount: bounty.totalAmount,
      status: bounty.status,
      expirationDate: bounty.expirationDate,
      bountyType: bounty.bountyType,
      solutionsCount: bounty.solutions.length,
      contributionsCount: bounty.contributions.length,
    };
  },
};
