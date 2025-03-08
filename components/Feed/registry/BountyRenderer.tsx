import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import Link from 'next/link';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ExpandableContent } from '../shared';
import { ArrowUp, MessageCircle, Edit2, Trash2, Share } from 'lucide-react';

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

    // Add bounty type badge
    if (bounty.bountyType) {
      badges.push(
        <div
          key="type"
          className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {bounty.bountyType}
        </div>
      );
    }

    // Add contributions badge if there are any
    if (bounty.contributions && bounty.contributions.length > 0) {
      badges.push(
        <div
          key="contributions"
          className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
        >
          {bounty.contributions.length} Contribution
          {bounty.contributions.length !== 1 ? 's' : ''}
        </div>
      );
    }

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

    return (
      <div className="space-y-3">
        {/* Badges */}
        {badges.length > 0 && <div className="flex flex-wrap gap-2 mb-2">{badges}</div>}

        {/* Expandable content */}
        {description && (
          <ExpandableContent
            content={description}
            isExpanded={isExpanded}
            onToggleExpand={onToggleExpand}
            maxLength={200}
          />
        )}

        {/* Bounty amount */}
        <div className="text-lg font-semibold text-green-600">
          {formatCurrency(bounty.totalAmount)}
        </div>

        {/* Expiration date */}
        {bounty.expirationDate && (
          <div className="text-sm text-gray-500">
            Expires: {new Date(bounty.expirationDate).toLocaleDateString()}
          </div>
        )}

        {/* Contributions list */}
        {bounty.contributions && bounty.contributions.length > 0 && (
          <div className="mt-3 border-t pt-3">
            <h4 className="text-sm font-medium mb-2">Contributions:</h4>
            <ul className="space-y-2">
              {bounty.contributions.map((contribution) => {
                const contributor = extractContributorData(contribution);
                return (
                  <li
                    key={contribution.id.toString()}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {contributor.profileImage && (
                        <img
                          src={contributor.profileImage}
                          alt={contributor.fullName}
                          className="w-6 h-6 rounded-full mr-2"
                        />
                      )}
                      <span className="text-sm">{contributor.fullName}</span>
                    </div>
                    <span className="text-sm font-medium">
                      {formatCurrency(contribution.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
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
    const { onContribute, onViewSolution } = options;

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {isOpen && (
          <Button variant="default" size="sm" onClick={onContribute}>
            Contribute
          </Button>
        )}

        <Button
          variant={isOpen ? 'secondary' : 'default'}
          size="sm"
          onClick={() => {
            if (onViewSolution && bounty.solutions.length > 0) {
              const solution = bounty.solutions[0];
              onViewSolution(
                solution.id,
                solution.createdBy?.authorProfile?.fullName || 'Unknown',
                solution.awardedAmount
              );
            }
          }}
        >
          {isOpen ? 'Submit Solution' : 'View Solutions'}
        </Button>
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
