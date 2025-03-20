import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Comment, CommentType } from '@/types/comment';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import { ExpandableContent } from '../shared';
import { useState } from 'react';
import { MessageCircle, ArrowUp, Flag, Edit2, Trash2, Share } from 'lucide-react';
import { CommentReadOnly } from '@/components/Comment/CommentReadOnly';
import { BountyRenderer } from './BountyRenderer';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  findActiveBounty,
  findClosedBounty,
  calculateTotalBountyAmount,
  isExpiringSoon,
  getDisplayBounty,
} from '@/components/Bounty/lib/bountyUtil';
import { BountyCardWrapper } from '@/components/Bounty';
import { contentRenderers } from '.';
import { ReactNode } from 'react';

/**
 * Renderer for comment content
 */
export const CommentRenderer: ContentRenderer<Comment> = {
  renderHeader: (comment, options = {}) => {
    const authorData = CommentRenderer.getAuthorData(comment);
    const metadata = CommentRenderer.getMetadata(comment);

    // For bounty comments, use a different approach
    if (comment.commentType === 'BOUNTY' && comment.bounties && comment.bounties.length > 0) {
      const displayBounty = getDisplayBounty(comment.bounties);

      if (displayBounty) {
        const isOpen = !!findActiveBounty(comment.bounties);
        const expiringSoon = isOpen && isExpiringSoon(displayBounty.expirationDate);
        const totalAmount = calculateTotalBountyAmount(comment.bounties);

        return (
          <FeedItemHeader
            contentType="bounty"
            timestamp={comment.createdDate}
            author={{
              id: displayBounty.createdBy.id,
              fullName: displayBounty.createdBy.authorProfile?.fullName || 'Unknown User',
              profileImage: displayBounty.createdBy.authorProfile?.profileImage || null,
              profileUrl: displayBounty.createdBy.authorProfile?.profileUrl || '#',
              isVerified: displayBounty.createdBy.authorProfile?.user?.isVerified,
            }}
            bountyAmount={totalAmount}
            bountyStatus={expiringSoon ? 'expiring' : isOpen ? 'open' : 'closed'}
            action={isOpen ? 'opened' : 'awarded'}
          />
        );
      }
    }

    // For review comments, include the score
    const score = comment.commentType === 'REVIEW' ? comment.score : undefined;

    return (
      <FeedItemHeader
        contentType={comment.commentType?.toLowerCase() || 'comment'}
        timestamp={comment.createdDate}
        author={
          typeof authorData === 'object' && !Array.isArray(authorData) ? authorData : undefined
        }
        score={score}
        action={metadata.action}
      />
    );
  },

  renderBody: (comment, options = {}) => {
    const { isExpanded = false, onToggleExpand = () => {} } = options;

    // For bounty comments, we should not handle them here
    // They should be handled by BountyCardWrapper directly
    if ((comment.commentType === 'BOUNTY' || comment.bounties?.length > 0) && comment.bounties) {
      console.warn('CommentRenderer should not be used for bounty comments');
      return null;
    }

    // Helper function to safely render rating content
    const renderRating = (): ReactNode => {
      if (!('rating' in comment) || !comment.rating) {
        return null;
      }

      return (
        <div className="text-sm text-gray-700">
          <span className="font-medium">Rating:</span> {String(comment.rating)}/5
        </div>
      );
    };

    // Helper function to safely render section ratings
    const renderSectionRatings = (): ReactNode => {
      if (
        !('sectionRatings' in comment) ||
        !comment.sectionRatings ||
        typeof comment.sectionRatings !== 'object' ||
        Object.keys(comment.sectionRatings).length === 0
      ) {
        return null;
      }

      return (
        <div className="text-sm text-gray-700">
          <h4 className="font-medium mb-1">Section Ratings:</h4>
          <ul className="space-y-1">
            {Object.entries(comment.sectionRatings).map(([section, rating]) => (
              <li key={section}>
                {section}: {String(rating)}
              </li>
            ))}
          </ul>
        </div>
      );
    };

    return (
      <div className="space-y-4">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          contentType="paper" // Default content type
        />

        {/* Rating if available */}
        {renderRating()}

        {/* Section ratings if available */}
        {renderSectionRatings()}
      </div>
    );
  },

  /**
   * Render content-specific actions that appear within the body
   * (e.g., special actions for review comments, etc.)
   */
  renderContentActions: (comment, options = {}) => {
    // For bounty comments, we should not handle them here
    if ((comment.commentType === 'BOUNTY' || comment.bounties?.length > 0) && comment.bounties) {
      return null;
    }

    // For review comments, we might have special actions
    if (comment.commentType === 'REVIEW') {
      return (
        <div className="flex flex-wrap gap-2 mt-4">
          <Button variant="secondary" size="sm">
            View Full Review
          </Button>
        </div>
      );
    }

    // Most comments don't have content-specific actions
    return null;
  },

  /**
   * Render footer actions that appear at the bottom of every card
   * (e.g., "Upvote", "Reply", "Flag" for comments)
   */
  renderFooterActions: (comment, options = {}) => {
    const {
      showActions = true,
      onUpvote,
      onReply,
      onEdit,
      onDelete,
      onReport,
      onShare,
      isAuthor = false,
    } = options;

    if (!showActions) return null;

    const isBountyComment =
      comment.commentType === 'BOUNTY' || (comment.bounties && comment.bounties.length > 0);

    return (
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => onUpvote && onUpvote(comment.id)}
          >
            <ArrowUp className="h-4 w-4" />
            <span>Upvote</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => onReply && onReply(comment.id)}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Reply</span>
          </Button>

          {isAuthor && onEdit && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5"
              onClick={() => onEdit(comment.id)}
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
              onClick={() => onDelete(comment.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Delete</span>
            </Button>
          )}

          {isBountyComment ? (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-500"
              onClick={() => onShare && onShare(comment.id)}
            >
              <Share className="h-4 w-4" />
              <span className="sr-only">Share</span>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 text-gray-500"
              onClick={() => onReport && onReport(comment.id)}
            >
              <Flag className="h-4 w-4" />
              <span className="sr-only">Report</span>
            </Button>
          )}
        </div>
      </div>
    );
  },

  getUrl: (comment) => {
    const threadId = comment.thread?.objectId || '';
    const commentId = comment.id;

    if (comment.commentType === 'BOUNTY') {
      return `/bounty/${threadId}/${commentId}`;
    }

    return `/comment/${threadId}/${commentId}`;
  },

  getAuthorData: (comment): AuthorData => {
    if (!comment.author) {
      return DefaultRenderer.getAuthorData(comment) as AuthorData;
    }

    return {
      id: comment.author.id,
      fullName: comment.author.fullName || 'Unknown',
      profileImage: comment.author.profileImage,
      profileUrl: comment.author.profileUrl || '#',
      isVerified: comment.author.isVerified,
    };
  },

  getMetadata: (comment) => {
    let action = 'commented';

    switch (comment.commentType) {
      case 'BOUNTY':
        action = 'opened bounty';
        break;
      case 'REVIEW':
        action = 'peer reviewed';
        break;
      case 'ANSWER':
        action = 'answered';
        break;
    }

    return {
      action,
      timestamp: comment.createdDate,
      type: comment.commentType?.toLowerCase() || 'comment',
      score: comment.score,
    };
  },
};
