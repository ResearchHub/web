import { useState } from 'react';
import { ContentType, Work } from '@/types/work';
import { Bounty } from '@/types/bounty';
import { ID } from '@/types/root';
import { ContentFormat } from '@/types/comment';

// Components
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';
import { contentRenderers } from '@/components/Feed/registry';
import { useSession } from 'next-auth/react';
import { ExpandableContent } from '@/components/Feed/shared';

// Utils
import {
  isExpiringSoon,
  getBountyTitle,
  extractContributors,
  filterOutCreator,
} from '@/components/Bounty/lib/bountyUtil';

import { Button } from '@/components/ui/Button';

export interface SolutionViewEvent {
  solutionId: ID;
  authorName: string;
  awardedAmount?: string;
}

export interface BountyCardProps {
  // Bounty data
  bounty: Bounty;

  // Related work data
  relatedWork?: Work;

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
  showFooter?: boolean;
  showActions?: boolean;
}

export const BountyCard = ({
  // Bounty data
  bounty,

  // Related work data
  relatedWork,

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
  const expiringSoon = isExpiringSoon(bounty.expirationDate);

  // Get all contributors including the main bounty creator
  const contributors = extractContributors([bounty], bounty);

  const handleContributeClick = () => {
    setShowContributeModal(true);
  };

  const handleContributeComplete = () => {
    setShowContributeModal(false);
    if (onBountyUpdated) {
      onBountyUpdated();
    }
  };

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    if (onViewSolution) {
      onViewSolution({ solutionId, authorName, awardedAmount });
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle navigation to the related work
  const handleRelatedWorkClick = () => {
    if (relatedWork?.id && relatedWork?.slug) {
      window.open(`/paper/${relatedWork.id}/${relatedWork.slug}`, '_blank');
    }
  };

  return (
    <div className="space-y-3">
      {/* Header - always shown */}
      <div className="mb-2">{renderer.renderHeader(bounty, { expiringSoon })}</div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Body - always show */}
        <div className="p-4">
          {/* Main content */}
          {renderer.renderBody(bounty, {
            isExpanded,
            onToggleExpand: toggleExpand,
            context: {
              commentContent: content,
              commentContentFormat: contentFormat,
              relatedWork: relatedWork,
              onRelatedWorkClick: handleRelatedWorkClick,
            },
          })}

          {/* Content-specific actions */}
          {renderer.renderContentActions(bounty, {
            isExpanded,
            onToggleExpand: toggleExpand,
            onContribute: handleContributeClick,
            onViewSolution: handleViewSolution,
            onNavigationClick,
            isAuthor,
            onAward: (id) => {
              // Handle award action if needed
              if (onBountyUpdated) {
                onBountyUpdated();
              }
            },
          })}
        </div>
      </div>

      {/* Footer actions - outside the card */}
      {showFooter &&
        renderer.renderFooterActions(bounty, {
          showActions,
          onUpvote,
          onReply,
          onEdit,
          onDelete,
          onShare,
          isAuthor,
        })}

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
