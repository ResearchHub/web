import { useState, useEffect } from 'react';
import { ContentType } from '@/types/work';
import { Bounty, BountyType } from '@/types/bounty';
import { ID } from '@/types/root';
import { ContentFormat } from '@/types/comment';
import { useRouter } from 'next/navigation';

// Components
import { Button } from '@/components/ui/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy } from '@fortawesome/pro-light-svg-icons';
import { BountyDetails } from '@/components/Bounty/BountyDetails';
import { BountyActions } from '@/components/Bounty/BountyActions';
import { BountySolutions } from '@/components/Bounty/BountySolutions';
import { BountyMetadataLine } from './BountyMetadataLine';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { SolutionModal } from '@/components/Comment/SolutionModal';
import { ContributorModal } from '@/components/modals/ContributorModal';
import { ContributeBountyModal } from '@/components/modals/ContributeBountyModal';

// Utils
import { buildWorkUrl } from '@/utils/url';
import {
  isExpiringSoon,
  getBountyTitle,
  calculateTotalBountyAmount,
  calculateTotalAwardedAmount,
  extractContributors,
  filterOutCreator,
  Contributor,
} from '@/components/Bounty/lib/bountyUtil';

interface BountyCardProps {
  // Core bounty data
  bountyType?: BountyType;
  totalBountyAmount: number;
  expirationDate?: string;
  isOpen: boolean;
  isPeerReviewBounty?: boolean;

  // Content data
  content?: any;
  contentFormat?: ContentFormat;

  // Document data
  documentId: number;
  contentType: ContentType;
  commentId?: number;

  // Solutions data
  solutions?: any[];
  totalAwardedAmount?: number;

  // Contributors data
  contributors: Contributor[];

  // Callbacks
  onSubmitSolution?: () => void;
  isCreator?: boolean;
  onBountyUpdated?: () => void;

  // Navigation
  slug?: string;
}

export const BountyCard = ({
  // Core bounty data
  bountyType,
  totalBountyAmount,
  expirationDate,
  isOpen,
  isPeerReviewBounty = false,

  // Content data
  content,
  contentFormat,

  // Document data
  documentId,
  contentType,
  commentId,

  // Solutions data
  solutions = [],
  totalAwardedAmount = 0,

  // Contributors data
  contributors,

  // Callbacks
  onSubmitSolution,
  isCreator = false,
  onBountyUpdated,

  // Navigation
  slug,
}: BountyCardProps) => {
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showContributorsModal, setShowContributorsModal] = useState(false);
  const [showContributeModal, setShowContributeModal] = useState(false);
  const [selectedSolutionId, setSelectedSolutionId] = useState<ID | null>(null);
  const [selectedSolutionAuthor, setSelectedSolutionAuthor] = useState<string>('');
  const [selectedSolutionAwardedAmount, setSelectedSolutionAwardedAmount] = useState<string>('');
  const router = useRouter();
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Handle navigation in useEffect to ensure it only runs client-side
  useEffect(() => {
    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  }, [pendingNavigation, router]);

  const expiringSoon = isOpen && isExpiringSoon(expirationDate);

  // Check if there are any solutions for the closed bounty
  const hasSolutions = !isOpen && solutions && solutions.length > 0;

  const handleViewSolution = (solutionId: ID, authorName: string, awardedAmount?: string) => {
    setSelectedSolutionId(solutionId);
    setSelectedSolutionAuthor(authorName);
    setSelectedSolutionAwardedAmount(awardedAmount || '');
  };

  const handleNavigationClick = (tab: 'reviews' | 'conversation') => {
    // Set the pending navigation URL based on content type
    if (contentType === 'paper') {
      // For papers, use the buildWorkUrl function to get the base URL with slug
      const baseUrl = buildWorkUrl({
        id: documentId,
        contentType: 'paper',
        slug: slug || '',
      });

      // Navigate to the specified tab
      setPendingNavigation(`${baseUrl}/${tab}`);
    } else {
      // For posts, navigate to the post page with optional tab
      setPendingNavigation(`/post/${documentId}${tab === 'conversation' ? '/conversation' : ''}`);
    }
  };

  const handleContributeClick = () => {
    setShowContributeModal(true);
  };

  const handleContributeComplete = () => {
    // Call the parent's onBountyUpdated callback if provided
    if (onBountyUpdated) {
      onBountyUpdated();
    }
  };

  return (
    <>
      <div className="space-y-4 p-4">
        {/* Bounty metadata in a single line */}
        <BountyMetadataLine
          bountyType={bountyType}
          amount={totalBountyAmount}
          expirationDate={expirationDate}
          isOpen={isOpen}
          expiringSoon={expiringSoon}
        />

        {/* Details section */}
        {content && (
          <div className="mt-6 pt-4 border-t border-gray-100">
            <BountyDetails content={content} contentFormat={contentFormat} />
          </div>
        )}

        {/* Action buttons with contributors */}
        <div className={`mt-6 ${isOpen ? 'flex items-center justify-between' : 'w-full'}`}>
          {isOpen ? (
            <div className="flex items-center justify-between w-full pt-4 border-t border-gray-200">
              <BountyActions
                isOpen={isOpen}
                isCreator={isCreator}
                isPeerReviewBounty={isPeerReviewBounty}
                onAwardClick={() => setShowAwardModal(true)}
                onNavigationClick={handleNavigationClick}
                onContributeClick={handleContributeClick}
              />

              {/* Contributors display */}
              <div className="ml-4">
                <ContributorsButton
                  contributors={contributors}
                  onContribute={handleContributeClick}
                  label="Contributors"
                />
              </div>
            </div>
          ) : (
            hasSolutions && (
              <BountySolutions
                solutions={solutions}
                isPeerReviewBounty={isPeerReviewBounty}
                totalAwardedAmount={totalAwardedAmount}
                onViewSolution={handleViewSolution}
              />
            )
          )}
        </div>
      </div>

      {/* Solution Modal */}
      {selectedSolutionId && (
        <SolutionModal
          isOpen={!!selectedSolutionId}
          onClose={() => {
            setSelectedSolutionId(null);
            setSelectedSolutionAuthor('');
            setSelectedSolutionAwardedAmount('');
          }}
          commentId={selectedSolutionId}
          documentId={documentId}
          contentType={contentType}
          solutionAuthorName={selectedSolutionAuthor}
          awardedAmount={selectedSolutionAwardedAmount}
        />
      )}

      {/* Contributors Modal */}
      <ContributorModal
        isOpen={showContributorsModal}
        onClose={() => setShowContributorsModal(false)}
        contributors={contributors.map(({ profile, amount }) => ({ profile, amount }))}
        onContribute={handleContributeClick}
      />

      {/* Contribute Modal */}
      {isOpen && commentId && (
        <ContributeBountyModal
          isOpen={showContributeModal}
          onClose={() => {
            setShowContributeModal(false);
          }}
          onContributeSuccess={handleContributeComplete}
          commentId={commentId}
          documentId={documentId}
          contentType={contentType}
          bountyTitle={getBountyTitle({ bountyType } as any, isOpen)}
          bountyType={bountyType as BountyType}
          expirationDate={
            expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          }
        />
      )}
    </>
  );
};
