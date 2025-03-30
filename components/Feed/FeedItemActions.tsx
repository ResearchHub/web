'use client';

import { FC, useState, ReactNode } from 'react';
import React from 'react';
import { FeedContentType, FeedEntry } from '@/types/feed';
import { MessageCircle, Flag, ArrowUp, MoreHorizontal, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useVote } from '@/hooks/useVote';
import { UserVoteType } from '@/types/reaction';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFlagModal } from '@/hooks/useFlagging';
import { FlagContentModal } from '@/components/modals/FlagContentModal';
import { ContentType } from '@/types/work';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { useRouter } from 'next/navigation';

interface ActionButtonProps {
  icon: any;
  count?: number | string;
  label: string;
  tooltip?: string;
  onClick?: (e?: React.MouseEvent) => void;
  isActive?: boolean;
  isDisabled?: boolean;
  className?: string;
  showLabel?: boolean;
  showTooltip?: boolean;
}

// Export ActionButton so it can be used in other components
export const ActionButton: FC<ActionButtonProps> = ({
  icon: Icon,
  count,
  label,
  tooltip,
  onClick,
  isActive = false,
  isDisabled = false,
  className = '',
  showLabel = false,
  showTooltip = true,
}) => (
  <Button
    variant="ghost"
    size="sm"
    className={`flex items-center space-x-1.5 ${isActive ? 'text-primary-600' : 'text-gray-900'} hover:text-gray-900 ${className}`}
    tooltip={showTooltip ? tooltip : undefined}
    onClick={onClick}
    disabled={isDisabled}
  >
    <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : ''}`} />
    {showLabel ? (
      <span className="text-sm font-medium">{label}</span>
    ) : count !== undefined ? (
      <span className="text-sm font-medium">{count}</span>
    ) : null}
  </Button>
);

interface FeedItemActionsProps {
  metrics?: FeedEntry['metrics'];
  feedContentType: FeedContentType;
  votableEntityId: number;
  relatedDocumentId?: number;
  relatedDocumentContentType?: ContentType;
  userVote?: UserVoteType;
  actionLabels?: {
    comment?: string;
    upvote?: string;
    report?: string;
  };
  onComment?: () => void;
  children?: ReactNode; // Add children prop to accept additional action buttons
  showTooltips?: boolean; // New property for controlling tooltips
  hideCommentButton?: boolean; // New property to hide the comment button
  hideReportButton?: boolean; // New property to hide the report button
  menuItems?: Array<{
    icon: any;
    label: string;
    onClick: (e?: React.MouseEvent) => void;
  }>;
  rightSideActionButton?: ReactNode; // New property for a custom action button on the right side
  href?: string; // URL to use for navigation
}

export const FeedItemActions: FC<FeedItemActionsProps> = ({
  metrics,
  userVote,
  feedContentType,
  votableEntityId,
  relatedDocumentId,
  relatedDocumentContentType,
  actionLabels,
  onComment,
  children, // Accept children prop
  showTooltips = true, // Default to showing tooltips
  hideCommentButton = false, // Default to showing the comment button
  hideReportButton = false, // Default to showing the report button
  menuItems = [], // Default to empty array for additional menu items
  rightSideActionButton, // Accept custom action button
  href,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const [localVoteCount, setLocalVoteCount] = useState(metrics?.votes || 0);
  const [localUserVote, setLocalUserVote] = useState<UserVoteType | undefined>(userVote);
  const router = useRouter();

  const { vote, isVoting } = useVote({
    votableEntityId,
    feedContentType,
    relatedDocumentId,
    onVoteSuccess: (response, voteType) => {
      // Update local state based on vote type
      if (voteType === 'UPVOTE' && localUserVote !== 'UPVOTE') {
        setLocalVoteCount((prev) => prev + 1);
      } else if (voteType === 'NEUTRAL' && localUserVote === 'UPVOTE') {
        setLocalVoteCount((prev) => Math.max(0, prev - 1));
      }
      setLocalUserVote(voteType);
    },
  });

  // Use the flag modal hook
  const { isOpen, contentToFlag, openFlagModal, closeFlagModal } = useFlagModal();

  const handleVote = () => {
    executeAuthenticatedAction(() => {
      // Toggle vote: if already upvoted, neutralize, otherwise upvote
      const newVoteType: UserVoteType = localUserVote === 'UPVOTE' ? 'NEUTRAL' : 'UPVOTE';
      vote(newVoteType);
    });
  };

  const handleComment = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (href) {
      router.push(`${href}/conversation`);
    } else if (onComment) {
      onComment();
    }
  };

  const handleReviewClick = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (href) {
      router.push(`${href}/reviews`);
    }
  };

  const handleReport = () => {
    executeAuthenticatedAction(() => {
      // Map feedContentType to ContentType
      let contentType: ContentType;
      let commentId: string | undefined;

      if (feedContentType === 'PAPER') {
        contentType = 'paper';
      } else if (feedContentType === 'POST' || feedContentType === 'PREREGISTRATION') {
        contentType = 'post';
      } else if (feedContentType === 'BOUNTY' && relatedDocumentContentType) {
        contentType = relatedDocumentContentType;
        commentId = votableEntityId.toString(); // Use votableEntityId as commentId for bounties
      } else if (feedContentType === 'COMMENT') {
        contentType = relatedDocumentContentType || 'post';
        commentId = votableEntityId.toString();
      } else {
        contentType = 'post'; // Default fallback
      }

      openFlagModal(
        // For comments and bounties, use relatedDocumentId as the documentId
        (feedContentType === 'COMMENT' || feedContentType === 'BOUNTY') && relatedDocumentId
          ? relatedDocumentId.toString()
          : votableEntityId.toString(),
        contentType,
        commentId
      );
    });
  };

  return (
    <>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center space-x-4">
          <ActionButton
            icon={ArrowUp}
            count={localVoteCount}
            tooltip="Upvote"
            label={actionLabels?.upvote || 'Upvote'}
            onClick={handleVote}
            isActive={localUserVote === 'UPVOTE'}
            isDisabled={isVoting}
            showTooltip={showTooltips}
          />
          {!hideCommentButton && (
            <ActionButton
              icon={MessageCircle}
              count={actionLabels?.comment ? undefined : metrics?.comments}
              tooltip="Comment"
              label={actionLabels?.comment || 'Comment'}
              onClick={handleComment}
              showLabel={Boolean(actionLabels?.comment)}
              showTooltip={showTooltips}
            />
          )}
          {metrics?.reviewScore !== undefined && metrics.reviewScore > 0 && (
            <ActionButton
              icon={Star}
              count={metrics.reviewScore.toFixed(1)}
              tooltip="Peer Review"
              label="Peer Review"
              showTooltip={showTooltips}
              onClick={handleReviewClick}
            />
          )}
          {children} {/* Render additional action buttons */}
        </div>

        {/* Right side containing both custom action button and menu */}
        <div className="flex-grow flex justify-end items-center gap-3">
          {/* Custom right side action button if provided */}
          {rightSideActionButton}

          {/* Menu button */}
          {(!hideReportButton || menuItems.length > 0) && (
            <BaseMenu
              trigger={
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center text-gray-400 hover:text-gray-600"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </Button>
              }
              align="end"
            >
              {/* Render any additional menu items first */}
              {menuItems.map((item, index) => (
                <BaseMenuItem
                  key={`menu-item-${index}`}
                  onClick={item.onClick}
                  className="flex items-center gap-2"
                >
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span>{item.label}</span>
                </BaseMenuItem>
              ))}

              {/* Add a divider if we have both custom menu items and report */}
              {!hideReportButton && menuItems.length > 0 && (
                <div className="h-px my-1 bg-gray-200" />
              )}

              {/* Report menu item */}
              {!hideReportButton && (
                <BaseMenuItem onClick={handleReport} className="flex items-center gap-2">
                  <Flag className="w-4 h-4" />
                  <span>{actionLabels?.report || 'Report'}</span>
                </BaseMenuItem>
              )}
            </BaseMenu>
          )}
        </div>
      </div>

      {/* Flag Content Modal */}
      {contentToFlag && (
        <FlagContentModal
          isOpen={isOpen}
          onClose={closeFlagModal}
          documentId={contentToFlag.documentId}
          workType={contentToFlag.contentType}
          commentId={contentToFlag.commentId}
        />
      )}
    </>
  );
};
