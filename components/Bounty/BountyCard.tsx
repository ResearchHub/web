import { useState } from 'react';
import { ContentType } from '@/types/work';
import { Bounty, BountyType } from '@/types/bounty';
import { ID } from '@/types/root';
import { ContentFormat } from '@/types/comment';

// Components
import { BountyDetails } from '@/components/Bounty/BountyDetails';
import { BountyActions } from '@/components/Bounty/BountyActions';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { BountyMetadataLine } from './BountyMetadataLine';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { contentRenderers } from '@/components/Feed/registry';
import { useSession } from 'next-auth/react';

// Utils
import {
  isExpiringSoon,
  getBountyTitle,
  extractContributors,
  filterOutCreator,
  isOpenBounty,
} from '@/components/Bounty/lib/bountyUtil';

import { ArrowUp, MessageCircle, Share, Edit2, Trash2, Flag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export interface SolutionViewEvent {
  solutionId: ID;
  authorName: string;
  awardedAmount?: string;
}

export interface BountyCardProps {
  // Bounty data
  bounty: Bounty;

  // Content data
  content?: any;
  contentFormat?: ContentFormat;

  // Document data
  documentId?: number;
  contentType?: ContentType;
  commentId?: number;

  // Callbacks
  isCreator?: boolean;
  onBountyUpdated?: () => void;
  onViewSolution?: (event: SolutionViewEvent) => void;
  onNavigationClick?: (tab: 'reviews' | 'conversation') => void;
  onUpvote?: (bountyId: number) => void;
  onReply?: (bountyId: number) => void;
  onShare?: (bountyId: number) => void;
  onEdit?: (bountyId: number) => void;
  onDelete?: (bountyId: number) => void;

  // Navigation
  slug?: string;

  // Rendering options
  showHeader?: boolean;
  showFooter?: boolean;
  showActions?: boolean;
}

export const BountyCard = ({
  // Bounty data
  bounty,

  // Content data
  content,
  contentFormat,

  // Document data
  documentId,
  contentType,
  commentId,

  // Callbacks
  isCreator = false,
  onBountyUpdated,
  onViewSolution,
  onNavigationClick,
  onUpvote,
  onReply,
  onShare,
  onEdit,
  onDelete,

  // Navigation
  slug,

  // Rendering options
  showHeader = true,
  showFooter = true,
  showActions = true,
}: BountyCardProps) => {
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { data: session } = useSession();

  // Check if the current user is the author of the bounty
  const isAuthor = session?.user?.id === bounty?.createdBy?.id;

  // If no valid bounty is provided, don't render anything
  if (!bounty) {
    return null;
  }

  // Get the appropriate renderer from the registry
  const renderer = contentRenderers.bounty || contentRenderers.default;

  // Extract key properties from the bounty
  const isOpen = bounty.status === 'OPEN';
  const isPeerReviewBounty = bounty.bountyType === 'REVIEW';
  const expiringSoon = isExpiringSoon(bounty.expirationDate);
  const hasSolutions = bounty.solutions.length > 0;

  // Get all contributors including the main bounty creator
  const contributors = extractContributors([bounty], bounty);

  // Get total amount from the bounty
  const totalBountyAmount = parseFloat(bounty.totalAmount);

  // Calculate total awarded amount
  const totalAwardedAmount = bounty.solutions.reduce(
    (total, solution) => total + (solution.awardedAmount ? parseFloat(solution.awardedAmount) : 0),
    0
  );

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    if (onViewSolution) {
      onViewSolution({ solutionId, authorName, awardedAmount });
    }
  };

  const handleContributeClick = () => {
    setShowContributeModal(true);
  };

  const handleContributeComplete = () => {
    setShowContributeModal(false);
    if (onBountyUpdated) {
      onBountyUpdated();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Render the footer actions
  const renderFooterActions = () => {
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
  };

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header - only show if requested */}
        {showHeader && (
          <div className="p-4 border-b border-gray-200">
            {renderer.renderHeader(bounty, { expiringSoon })}
          </div>
        )}

        {/* Body - always show */}
        <div className="p-4">
          {/* Main content */}
          {renderer.renderBody(bounty, {
            isExpanded,
            onToggleExpand: toggleExpand,
          })}

          {/* Content-specific actions */}
          {renderer.renderContentActions(bounty, {
            isExpanded,
            onToggleExpand: toggleExpand,
          })}
        </div>
      </div>

      {/* Footer actions - moved outside the card */}
      {showFooter && renderFooterActions()}

      {/* Modals */}
      {showContributorsModal && (
        <ContributorModal
          isOpen={showContributorsModal}
          onClose={() => setShowContributorsModal(false)}
          contributors={filterOutCreator(contributors)}
          onContribute={handleContributeClick}
        />
      )}

      {showContributeModal && (
        <ContributeBountyModal
          isOpen={showContributeModal}
          onClose={() => setShowContributeModal(false)}
          onContributeSuccess={handleContributeComplete}
          commentId={commentId || 0}
          documentId={documentId || 0}
          contentType={contentType || 'paper'}
          bountyTitle={getBountyTitle(bounty, isOpen)}
          bountyType={bounty.bountyType}
          expirationDate={
            bounty.expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        />
      )}
    </div>
  );
};
