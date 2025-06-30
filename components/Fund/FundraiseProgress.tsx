'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline, isDeadlineInFuture } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Icon } from '../ui/icons';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useRouter } from 'next/navigation';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
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
  fundraiseTitle,
  compact = false,
  onContribute,
  showContribute = true,
  className,
  showPercentage = false,
  variant = 'default',
}) => {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();

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
  const isActive =
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);

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

    showShareModal({
      url: window.location.href,
      docTitle: fundraiseTitle,
      action: 'USER_FUNDED_PROPOSAL',
    });

    router.refresh();
  };

  // Determine the progress bar variant based on fundraise status and funding percentage
  const getProgressVariant = () => {
    if (fundraise.status === 'COMPLETED') {
      return actualPercentage >= 100 ? 'success' : 'gray';
    }
    return 'default';
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
          <Progress value={progressPercentage} variant={getProgressVariant()} size="xs" />
        </div>
      </>
    );
  }

  const defaultContainerClasses = compact
    ? 'p-3  bg-white rounded-lg border border-gray-200'
    : 'p-4 bg-white rounded-lg border border-gray-200';

  if (compact) {
    // Compact mode modifications for carousel
    return (
      <>
        <div className={cn(defaultContainerClasses, className)}>
          {/* Top row: Amount on left, status/time on right - Stack on mobile */}
          <div className="flex flex-row flex-wrap items-center justify-between gap-x-2 mb-3">
            {showPercentage ? (
              <div className="font-medium text-gray-700 text-sm mobile:!text-base min-w-0 truncate">
                {actualPercentage}% funded
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-wrap min-w-0 truncate">
                <CurrencyBadge
                  amount={Math.round(fundraise.amountRaised.rsc)}
                  variant="text"
                  size="xs"
                  showText={false}
                  currency={showUSD ? 'USD' : 'RSC'}
                  shorten
                  className="pl-0"
                />
                <span className="font-medium text-gray-700 mx-0.5 text-sm mobile:!text-base">
                  /
                </span>
                <CurrencyBadge
                  amount={Math.round(fundraise.goalAmount.rsc)}
                  variant="text"
                  size="xs"
                  showText={true}
                  currency={showUSD ? 'USD' : 'RSC'}
                  shorten
                />
              </div>
            )}

            {/* Status/Time Display - Will wrap to new line if needed */}
            <div className="flex-shrink-0 whitespace-nowrap">{getStatusDisplay()}</div>
          </div>

          {/* Progress bar - Keep as is but with better mobile spacing */}
          <div className="mb-3">
            <Progress value={progressPercentage} variant={getProgressVariant()} size="xs" />
          </div>

          {/* Bottom row: Fund CTA on left, contributors on right - Always in row on mobile and desktop */}
          <div className="flex items-center justify-between gap-3">
            {showContribute && (
              <Button
                variant="contribute"
                size="sm"
                disabled={!isActive}
                className="flex items-center gap-1 py-1.5 px-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold transition-all duration-200 border-0 text-xs"
                onClick={handleContributeClick}
              >
                <Icon name="giveRSC" size={16} color="white" />
                Fund
              </Button>
            )}

            {contributors.length > 0 && (
              <div className="cursor-pointer flex-shrink-0" onClick={handleContributeClick}>
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

            {/* Spacer to maintain layout when no contributors */}
            {contributors.length === 0 && showContribute && <div className="flex-shrink-0"></div>}
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
    // Default mode with original style but mobile improvements
    return (
      <>
        <div className={cn(defaultContainerClasses, className)}>
          <div className="mb-6">
            <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between mb-4 mobile:!mb-3 gap-3 mobile:!gap-0">
              {showPercentage ? (
                <div className="text-lg mobile:!text-xl font-medium text-gray-700">
                  {actualPercentage}% funded
                </div>
              ) : (
                <div className="flex items-center flex-wrap gap-1">
                  <CurrencyBadge
                    amount={Math.round(fundraise.amountRaised.rsc)}
                    variant="text"
                    size="md"
                    showText={false}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="font-medium text-orange-500 text-base mobile:!text-lg pl-0"
                  />
                  <span className="text-gray-500 text-base mobile:!text-lg">raised of</span>
                  <CurrencyBadge
                    amount={Math.round(fundraise.goalAmount.rsc)}
                    variant="text"
                    size="md"
                    showText={true}
                    showIcon={true}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="text-gray-500 text-base mobile:!text-lg"
                  />
                  <span className="text-gray-500 text-base mobile:!text-lg">goal</span>
                </div>
              )}
              <div className="mobile:!flex-shrink-0">{getStatusDisplay()}</div>
            </div>
            <Progress value={progressPercentage} variant={getProgressVariant()} className="h-3" />
          </div>

          <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between gap-4 mobile:!gap-0">
            {showContribute && (
              <Button
                variant="contribute"
                size="md"
                disabled={!isActive}
                className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-all duration-200 border-0"
                onClick={handleContributeClick}
              >
                <Icon name="giveRSC" size={20} color="white" />
                Fund this research
              </Button>
            )}

            {contributors.length > 0 && (
              <div
                className={cn(
                  showContribute
                    ? 'flex justify-center mobile:!justify-end'
                    : 'mobile:!ml-auto flex justify-center mobile:!justify-end'
                )}
              >
                <ContributorsButton
                  contributors={contributors}
                  onContribute={handleContributeClick}
                  label={`Funders`}
                  size="md"
                  disableContribute={!isActive}
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
