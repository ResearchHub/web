import { useState } from 'react';
import { ContentType } from '@/types/work';
import { Bounty } from '@/types/bounty';
import { ID } from '@/types/root';
import { ContentFormat } from '@/types/comment';
import { BountyCard, SolutionViewEvent } from './BountyCard';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { getDisplayBounty } from './lib/bountyUtil';
import { useRouter } from 'next/navigation';
import { buildWorkUrl } from '@/utils/url';

interface BountyCardWrapperProps {
  // Option 1: Pass a single bounty
  bounty?: Bounty;

  // Option 2: Pass an array of bounties (for backward compatibility)
  bounties?: Bounty[];

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

/**
 * BountyCardWrapper is a component that wraps BountyCard and handles the modals.
 * This allows BountyCard to be used without directly depending on modals that have
 * specific ContentType requirements.
 *
 * It also provides backward compatibility for code that passes an array of bounties.
 */
export const BountyCardWrapper = ({
  bounty,
  bounties,
  content,
  contentFormat,
  documentId,
  contentType,
  commentId,
  isCreator,
  onBountyUpdated,
  onUpvote,
  onReply,
  onShare,
  onEdit,
  onDelete,
  slug,
  showHeader = true,
  showFooter = true,
  showActions = true,
}: BountyCardWrapperProps) => {
  const [selectedSolution, setSelectedSolution] = useState<SolutionViewEvent | null>(null);
  const router = useRouter();

  // Determine which bounty to display
  const displayBounty = useBountyToDisplay(bounty, bounties);

  // If no valid bounty is found, don't render anything
  if (!displayBounty) {
    return null;
  }

  const handleViewSolution = (event: SolutionViewEvent) => {
    setSelectedSolution(event);
  };

  const handleNavigationClick = (tab: 'reviews' | 'conversation') => {
    if (!documentId || !contentType) return;

    // Use the correct parameters for buildWorkUrl
    const baseUrl = buildWorkUrl({
      id: documentId,
      contentType: contentType === 'paper' || contentType === 'post' ? contentType : 'paper',
      slug,
    });

    if (tab === 'reviews') {
      router.push(`${baseUrl}?tab=reviews`);
    } else {
      router.push(`${baseUrl}?tab=conversation`);
    }
  };

  return (
    <>
      <BountyCard
        bounty={displayBounty}
        content={content}
        contentFormat={contentFormat}
        documentId={documentId}
        contentType={contentType}
        commentId={commentId}
        isCreator={isCreator}
        onBountyUpdated={onBountyUpdated}
        onViewSolution={handleViewSolution}
        onNavigationClick={handleNavigationClick}
        onUpvote={onUpvote}
        onReply={onReply}
        onShare={onShare}
        onEdit={onEdit}
        onDelete={onDelete}
        slug={slug}
        showHeader={showHeader}
        showFooter={showFooter}
        showActions={showActions}
      />

      {selectedSolution && (
        <SolutionModal
          isOpen={!!selectedSolution}
          onClose={() => setSelectedSolution(null)}
          commentId={selectedSolution.solutionId}
          documentId={documentId || 0}
          contentType={'paper'} // Default to paper for compatibility
          solutionAuthorName={selectedSolution.authorName}
          awardedAmount={selectedSolution.awardedAmount}
        />
      )}
    </>
  );
};

/**
 * Helper function to determine which bounty to display
 */
function useBountyToDisplay(bounty?: Bounty, bounties?: Bounty[]): Bounty | null {
  // If a single bounty is provided, use it
  if (bounty) {
    return bounty;
  }

  // If bounties array is provided, find the appropriate one to display
  if (bounties && bounties.length > 0) {
    // Since we've restructured bounties to group contributions with their parent bounties,
    // we can simply use getDisplayBounty which will find the first open or closed bounty
    return getDisplayBounty(bounties) || null;
  }

  // If no valid bounty is found, return null
  return null;
}
