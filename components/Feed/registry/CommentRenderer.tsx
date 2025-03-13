import { ContentRenderer, AuthorData, RenderOptions } from './types';
import { FeedItemHeader } from '../FeedItemHeader';
import { Comment, CommentType } from '@/types/comment';
import { Button } from '@/components/ui/Button';
import { DefaultRenderer } from './DefaultRenderer';
import { ExpandableContent } from '../shared';
import { useState } from 'react';
import {
  MessageCircle,
  ArrowUp,
  Flag,
  Edit2,
  Trash2,
  Share,
  Star,
  MoreVertical,
} from 'lucide-react';
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
import { Badge } from '@/components/ui/Badge';
import { ActionButton } from '../ActionButton';
import { UpvoteAndCommentButton } from '@/components/ui/UpvoteAndCommentButton';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';

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
          />
        );
      }
    }

    // For review comments, include the score
    const score = comment.commentType === 'REVIEW' ? comment.score : undefined;

    return (
      <FeedItemHeader
        contentType={'comment'}
        timestamp={comment.createdDate}
        author={
          typeof authorData === 'object' && !Array.isArray(authorData) ? authorData : undefined
        }
        score={score}
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

    // Helper function to create a badge
    const createBadge = (
      key: string,
      text: string,
      extraContent?: ReactNode,
      variant: 'purple' | 'green' | 'blue' | 'gray' = 'blue',
      icon?: ReactNode
    ) => {
      // Define color classes based on variant
      const colorClasses = {
        purple: 'bg-purple-100 text-purple-800',
        green: 'bg-green-100 text-green-800',
        blue: 'bg-blue-100 text-blue-800',
        gray: 'bg-gray-100 text-gray-700 border border-gray-200',
      };

      return (
        <div
          key={key}
          className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${colorClasses[variant]}`}
        >
          {icon}
          <span>{text}</span>
          {extraContent}
        </div>
      );
    };

    // Create badges
    const badges = [];

    // Add peer review badge if this is a review comment
    if (comment.commentType === 'REVIEW') {
      // Check if we have a score to display
      const hasScore = 'score' in comment && typeof comment.score === 'number';

      const scoreContent = hasScore ? (
        <>
          <span className="mx-0.5">•</span>
          <span>{comment.score}/5</span>
        </>
      ) : null;

      badges.push(
        createBadge(
          'peer-review',
          'Peer Review',
          scoreContent,
          'gray',
          <Star className="h-3 w-3" />
        )
      );
    }

    // Add answer badge if this is an answer comment
    if (comment.commentType === 'ANSWER') {
      badges.push(
        createBadge('answer', 'Answer', null, 'gray', <MessageCircle className="h-3 w-3" />)
      );
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
        {/* Display badges if any */}
        {badges.length > 0 && <div className="flex flex-wrap gap-2 mb-3">{badges}</div>}

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
    const {
      showActions = true,
      onUpvote,
      onReply,
      onEdit,
      onDelete,
      onReport,
      onShare,
      isAuthor = false,
      useFooterActions = false,
      contentType = 'paper',
      documentId,
    } = options;

    // For bounty comments, we should not handle them here
    if ((comment.commentType === 'BOUNTY' || comment.bounties?.length > 0) && comment.bounties) {
      return null;
    }

    // If we're using footer actions, only show content-specific actions
    if (useFooterActions) {
      // For review comments, we might have special actions
      if (comment.commentType === 'REVIEW') {
        return (
          <div className="flex flex-wrap gap-2 mt-4">
            <Button
              size="sm"
              className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
            >
              Read Full Review
            </Button>
          </div>
        );
      }

      // Most comments don't have content-specific actions
      return null;
    }

    // If we are not using footer actions, include all actions here
    if (!showActions) return null;

    const isBountyComment =
      comment.commentType === 'BOUNTY' || (comment.bounties && comment.bounties.length > 0);

    // Get upvote and comment counts
    const upvoteCount = comment.score || 0;
    const commentCount = comment.replyCount || comment.childrenCount || 0;

    return (
      <div className="mt-4 flex items-center justify-between">
        <div className="w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Use the UpvoteAndCommentButton in votable mode if documentId is provided, otherwise use it in direct callback mode */}
              {documentId ? (
                <UpvoteAndCommentButton
                  votableEntityId={comment.id}
                  documentId={documentId}
                  contentType={contentType}
                  userVote={comment.userVote}
                  score={comment.score}
                  onComment={() => onReply && onReply(comment.id)}
                  commentCount={commentCount}
                />
              ) : (
                <UpvoteAndCommentButton
                  onVoteSuccess={() => onUpvote && onUpvote(comment.id)}
                  onComment={() => onReply && onReply(comment.id)}
                  isUpvoted={comment.userVote === 'UPVOTE'}
                  upvoteCount={upvoteCount}
                  commentCount={commentCount}
                />
              )}

              {/* For review comments, add a View Full Review button */}
              {comment.commentType === 'REVIEW' && (
                <Button
                  size="sm"
                  className="flex items-center gap-2 shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-700"
                >
                  Read Full Review
                </Button>
              )}
            </div>

            {/* Three dots menu with options - positioned right after the actions */}
            <BaseMenu
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 p-1 h-8 w-8 rounded-full"
                >
                  <MoreVertical className="w-4 h-4 text-gray-700" />
                </Button>
              }
            >
              {isAuthor && onEdit && (
                <BaseMenuItem onClick={() => onEdit(comment.id)}>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </BaseMenuItem>
              )}
              {isAuthor && onDelete && (
                <BaseMenuItem onClick={() => onDelete(comment.id)}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </BaseMenuItem>
              )}
              {isBountyComment && onShare && (
                <BaseMenuItem onClick={() => onShare(comment.id)}>
                  <Share className="w-4 h-4 mr-2" />
                  Share
                </BaseMenuItem>
              )}
              {onReport && (
                <BaseMenuItem onClick={() => onReport(comment.id)}>
                  <Flag className="w-4 h-4 mr-2" />
                  Flag
                </BaseMenuItem>
              )}
            </BaseMenu>
          </div>
        </div>
      </div>
    );
  },

  /**
   * Render footer actions that appear at the bottom of every card
   * (e.g., "Upvote", "Reply", "Flag" for comments)
   *
   * Note: This is used when useFooterActions is true
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
      useFooterActions = false,
    } = options;

    // If not using footer actions, return null as we've moved all functionality to renderContentActions
    if (!useFooterActions) return null;

    if (!showActions) return null;

    const isBountyComment =
      comment.commentType === 'BOUNTY' || (comment.bounties && comment.bounties.length > 0);

    return (
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-3">
          <ActionButton
            icon={ArrowUp}
            count={comment.score}
            tooltip="Upvote"
            label="Upvote"
            onClick={() => onUpvote && onUpvote(comment.id)}
            showLabel={true}
          />

          <ActionButton
            icon={MessageCircle}
            count={comment.replyCount}
            tooltip="Comment"
            label="Comment"
            onClick={() => onReply && onReply(comment.id)}
            showLabel={true}
          />

          {isAuthor && onEdit && (
            <ActionButton
              icon={Edit2}
              tooltip="Edit"
              label="Edit"
              onClick={() => onEdit(comment.id)}
            />
          )}
        </div>

        <div className="flex items-center gap-3">
          {isAuthor && onDelete && (
            <ActionButton
              icon={Trash2}
              tooltip="Delete"
              label="Delete"
              onClick={() => onDelete(comment.id)}
              className="text-gray-500"
            />
          )}

          {isBountyComment ? (
            <ActionButton
              icon={Share}
              tooltip="Share"
              label="Share"
              onClick={() => onShare && onShare(comment.id)}
              className="text-gray-500"
            />
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onReport && onReport(comment.id)}
              className="text-gray-500"
              tooltip="Flag"
            >
              <Flag className="w-5 h-5 text-gray-800" strokeWidth={2} />
              <span className="sr-only">Flag</span>
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
    // Determine the appropriate comment type
    const commentType = comment.commentType?.toLowerCase() || 'comment';

    return {
      timestamp: comment.createdDate,
      type: commentType,
      score: comment.score,
      // Include additional metadata that might be useful
      isReply: !!comment.parentId,
      hasReplies: (comment.replies?.length || 0) > 0,
      replyCount: comment.replyCount || comment.childrenCount || 0,
      // For bounty comments, include bounty information
      bountyAmount: comment.bountyAmount,
      bountyStatus:
        comment.bounties?.length > 0
          ? findActiveBounty(comment.bounties)
            ? isExpiringSoon(findActiveBounty(comment.bounties)?.expirationDate)
              ? 'expiring'
              : 'open'
            : 'closed'
          : undefined,
    };
  },
};
