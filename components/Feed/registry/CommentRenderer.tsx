import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Comment, CommentType } from '@/types/comment';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import { ExpandableContent } from '../shared';
import { useState } from 'react';
import { MessageCircle, ArrowUp, Flag, Edit2, Trash2 } from 'lucide-react';
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
        author={Array.isArray(authorData) ? authorData[0] : authorData}
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

    // For regular comments, render the content
    return (
      <div className="p-4 border border-gray-200 rounded-lg">
        <CommentReadOnly
          content={comment.content}
          contentFormat={comment.contentFormat}
          contentType="paper" // Default content type
        />
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
    // We're now handling footer actions in the cards themselves
    // This prevents duplicate footer actions and ensures consistent behavior
    return null;
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
