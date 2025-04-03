'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { formatRSC } from '@/utils/number';
import { Tooltip } from '@/components/ui/Tooltip';
import { Icon } from '../ui/icons';
import { AvatarStack } from '@/components/ui/AvatarStack';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  compact?: boolean;
  onContribute?: () => void;
  showContribute?: boolean;
  className?: string;
  /** Whether to show percentage funded instead of amounts */
  showPercentage?: boolean;
  /** Render in minimal mode with just percentage and days left */
  variant?: 'default' | 'minimal';
}

export const FundraiseProgress: FC<FundraiseProgressProps> = ({
  fundraise,
  compact = false,
  onContribute,
  showContribute = true,
  className,
  showPercentage = false,
  variant = 'default',
}) => {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  if (!fundraise) return null;

  const deadlineText = fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined;

  // Calculate progress percentage with a minimum of 5% for visibility
  const progressPercentage = Math.max(
    0,
    Math.min(100, Math.max(5, (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100))
  );

  // Calculate actual percentage for display
  const actualPercentage = Math.floor(
    (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100
  );

  // Extract contributors if available
  const contributors =
    fundraise.contributors?.topContributors?.map((contributor) => ({
      profile: {
        profileImage: contributor.authorProfile.profileImage,
        fullName: contributor.authorProfile.fullName,
        id: contributor.authorProfile.id,
      },
      amount: contributor.totalContribution,
    })) || [];

  // Check if fundraise is active
  const isActive = fundraise.status === 'OPEN' && deadlineText !== 'Ended';

  // Get status display for the top right when no contributors
  const getStatusDisplay = () => {
    switch (fundraise.status) {
      case 'COMPLETED':
        return (
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-green-500 font-medium`}>
            Fundraise Completed
          </span>
        );
      case 'CLOSED':
        return (
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 font-medium`}>
            Fundraise Closed
          </span>
        );
      case 'OPEN':
        return deadlineText === 'Ended' ? (
          <span className={`${compact ? 'text-xs' : 'text-sm'} text-gray-500 font-medium`}>
            Ended
          </span>
        ) : deadlineText ? (
          <div className="flex items-center gap-1.5 text-gray-800">
            <Clock className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            <span className={compact ? 'text-xs' : 'text-sm'}>{deadlineText}</span>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  const handleContributeClick = () => {
    setIsContributeModalOpen(true);
    if (onContribute) {
      onContribute();
    }
  };

  const handleContributeSuccess = () => {
    // Close the modal
    setIsContributeModalOpen(false);

    // Call the parent onContribute callback if provided
    if (onContribute) {
      onContribute();
    }
  };

  // Render minimal variant
  if (variant === 'minimal') {
    return (
      <>
        <div className={cn('rounded-lg', className)}>
          {/* Top row: Percentage on left, days left on right */}
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium text-sm text-gray-700">{actualPercentage}% funded</div>
            {getStatusDisplay()}
          </div>

          {/* Progress bar */}
          <Progress
            value={progressPercentage}
            variant={fundraise.status === 'COMPLETED' ? 'success' : 'default'}
            size="xs"
          />
        </div>
      </>
    );
  }

  const defaultContainerClasses = compact
    ? 'p-3 bg-white rounded-lg border border-gray-200'
    : 'p-4 bg-white rounded-lg border border-gray-200';

  if (compact) {
    // Compact mode modifications for carousel
    return (
      <>
        <div className={cn(defaultContainerClasses, className)}>
          {/* Top row: Amount on left, status/time on right */}
          <div className="flex items-center justify-between mb-2">
            {showPercentage ? (
              <div className="font-medium text-gray-700">{actualPercentage}% funded</div>
            ) : (
              <div className="flex items-center gap-1">
                <RSCBadge
                  amount={Math.round(fundraise.amountRaised.rsc)}
                  variant="text"
                  size="xs"
                  showText={false}
                  showExchangeRate={true}
                  shorten
                />
                <span className="font-medium text-gray-700 mx-0.5">/</span>
                <RSCBadge
                  amount={Math.round(fundraise.goalAmount.rsc)}
                  variant="text"
                  size="xs"
                  showText={true}
                  showExchangeRate={true}
                  shorten
                />
              </div>
            )}

            {/* Status/Time Display - Moved to top right */}
            {getStatusDisplay()}
          </div>

          {/* Progress bar - Keep as is */}
          <div className="mb-2">
            <Progress
              value={progressPercentage}
              variant={fundraise.status === 'COMPLETED' ? 'success' : 'default'}
              size="xs"
            />
          </div>

          {/* Bottom row: Fund CTA on left, contributors on right */}
          <div className="flex items-center justify-between">
            {showContribute && (
              <Button
                variant="contribute"
                size="sm"
                disabled={!isActive}
                className="flex items-center gap-1 py-1"
                onClick={handleContributeClick}
              >
                <Icon name="giveRSC" size={18} color="#F97316" />
                Fund
              </Button>
            )}

            {contributors.length > 0 && (
              <div
                className={cn(showContribute ? '' : 'ml-auto', 'cursor-pointer')}
                onClick={handleContributeClick}
              >
                {' '}
                {/* Push right if no contribute button */}
                <AvatarStack
                  items={contributors.map((contributor) => ({
                    src: contributor.profile.profileImage || '',
                    alt: contributor.profile.fullName,
                    tooltip: `Funded by ${contributor.profile.fullName}`,
                    authorId: contributor.profile.id,
                  }))}
                  size="xs"
                  maxItems={3}
                  spacing={-6}
                  showExtraCount={contributors.length > 3}
                  totalItemsCount={contributors.length}
                  extraCountLabel="Funders"
                  ringColorClass="ring-orange-50"
                />
              </div>
            )}
            {/* Ensure the div takes space even if empty to maintain layout */}
            {!showContribute && contributors.length === 0 && <div className="flex-1"></div>}
          </div>
        </div>

        {/* Contribute Modal - Keep as is */}
        <ContributeToFundraiseModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
        />
      </>
    );
  } else {
    // Default mode with original style
    return (
      <>
        <div className={cn(defaultContainerClasses, className)}>
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              {showPercentage ? (
                <div className="text-lg font-medium text-gray-700">{actualPercentage}% funded</div>
              ) : (
                <div className="flex items-center">
                  <RSCBadge
                    amount={Math.round(fundraise.amountRaised.rsc)}
                    variant="text"
                    size="md"
                    showText={false}
                    showExchangeRate={true}
                    className="font-medium text-orange-500 text-lg pl-0"
                  />
                  <span className="text-gray-500 text-lg">raised of</span>
                  <RSCBadge
                    amount={Math.round(fundraise.goalAmount.rsc)}
                    variant="text"
                    size="md"
                    showText={true}
                    showIcon={false}
                    showExchangeRate={true}
                    className="text-gray-500 text-lg"
                  />
                  <span className="text-gray-500 text-lg">goal</span>
                </div>
              )}
              {getStatusDisplay()}
            </div>
            <Progress
              value={progressPercentage}
              variant={fundraise.status === 'COMPLETED' ? 'success' : 'default'}
              className="h-3"
            />
          </div>

          <div className="flex items-center justify-between">
            {showContribute && (
              <Button
                variant="contribute"
                size="lg"
                disabled={!isActive}
                className="flex items-center gap-1.5"
                onClick={handleContributeClick}
              >
                <Icon name="giveRSC" size={20} color="#F97316" />
                Fund this research
              </Button>
            )}

            {contributors.length > 0 && (
              <div className={showContribute ? '' : 'ml-auto'}>
                <ContributorsButton
                  contributors={contributors}
                  onContribute={handleContributeClick}
                  label={`Funders`}
                  size="md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Contribute Modal */}
        <ContributeToFundraiseModal
          isOpen={isContributeModalOpen}
          onClose={() => setIsContributeModalOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundraise={fundraise}
        />
      </>
    );
  }
};
