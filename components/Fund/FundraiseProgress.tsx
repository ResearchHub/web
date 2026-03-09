'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline, formatExactTime, isDeadlineInFuture } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import type { Work } from '@/types/work';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Icon } from '../ui/icons';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/ui/Tooltip';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
  onContribute?: () => void;
  showContribute?: boolean;
  className?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'minimal';
  work?: Work;
  onDetailsClick?: () => void;
}

export const FundraiseProgress: FC<FundraiseProgressProps> = ({
  fundraise,
  fundraiseTitle,
  onContribute,
  showContribute = true,
  className,
  showPercentage = false,
  variant = 'default',
  work,
  onDetailsClick,
}) => {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();

  if (!fundraise) return null;

  const deadlineText = fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined;

  // Calculate progress percentage with a minimum of 5% for visibility
  const progressPercentage =
    fundraise.status === 'COMPLETED'
      ? 100
      : Math.max(
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
        return <span className="text-sm text-green-500 font-medium">Fundraise Completed</span>;
      case 'CLOSED':
        return <span className="text-sm text-gray-500 font-medium">Fundraise Closed</span>;
      case 'OPEN':
        return deadlineText?.includes('Ended') ? (
          <span className="text-sm text-gray-500 font-medium">Ended</span>
        ) : deadlineText ? (
          <div className="flex items-center gap-1.5 text-gray-800">
            <Clock className="h-4 w-4" />
            <Tooltip content={formatExactTime(fundraise.endDate!)} position="top" width="w-48">
              <span className="text-sm cursor-help">{deadlineText}</span>
            </Tooltip>
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
      return 'success'; // Always green when completed
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
            <div className="font-medium text-sm text-gray-700">
              <span className="font-mono">{actualPercentage}%</span> funded
            </div>
            {getStatusDisplay()}
          </div>

          {/* Progress bar */}
          <Progress value={progressPercentage} variant={getProgressVariant()} size="xs" />
        </div>
      </>
    );
  }

  const defaultContainerClasses = 'p-3 bg-white rounded-lg border border-primary-100';

  return (
    <>
      <div className={cn(defaultContainerClasses, className)}>
        <div className="mb-4">
          <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between mb-3 mobile:!mb-2 gap-2 mobile:!gap-0">
            {showPercentage ? (
              <div className="text-sm mobile:!text-base font-medium text-gray-700">
                <span className="font-mono">{actualPercentage}%</span> funded
              </div>
            ) : (
              <div className="flex items-center flex-wrap gap-1">
                <CurrencyBadge
                  amount={
                    showUSD
                      ? Math.round(fundraise.amountRaised.usd)
                      : Math.round(fundraise.amountRaised.rsc)
                  }
                  variant="text"
                  size="sm"
                  showText={false}
                  currency={showUSD ? 'USD' : 'RSC'}
                  className="font-mono text-sm mobile:!text-base pl-0"
                  fontWeight="font-semibold"
                  textColor="text-primary-600"
                  skipConversion={showUSD}
                />
                <span className="text-gray-500 text-sm mobile:!text-base">raised of</span>
                <CurrencyBadge
                  amount={
                    showUSD
                      ? Math.round(fundraise.goalAmount.usd)
                      : Math.round(fundraise.goalAmount.rsc)
                  }
                  variant="text"
                  size="sm"
                  showText={true}
                  showIcon={true}
                  currency={showUSD ? 'USD' : 'RSC'}
                  className="font-mono text-sm mobile:!text-base"
                  fontWeight="font-semibold"
                  textColor="text-primary-600"
                  skipConversion={showUSD}
                />
                <span className="text-gray-500 text-sm mobile:!text-base">goal</span>
              </div>
            )}
            <div className="mobile:!flex-shrink-0 hidden mobile:!block">{getStatusDisplay()}</div>
          </div>

          <Progress value={progressPercentage} variant={getProgressVariant()} className="h-2.5" />

          {/* Mobile: Status and Contributors in same row */}
          <div className="flex mobile:!hidden items-center justify-between mt-2.5">
            <div>{getStatusDisplay()}</div>
            {contributors.length > 0 && (
              <ContributorsButton
                contributors={contributors}
                onContribute={handleContributeClick}
                label={`Funders`}
                size="sm"
                disableContribute={!isActive}
              />
            )}
          </div>
        </div>

        <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between gap-3 mobile:!gap-0">
          {/* Desktop: Contributors on the left */}
          {contributors.length > 0 ? (
            <div className="hidden mobile:!flex">
              <ContributorsButton
                contributors={contributors}
                onContribute={handleContributeClick}
                label={`Funders`}
                size={20}
                disableContribute={!isActive}
              />
            </div>
          ) : (
            <div className="hidden mobile:!block flex-shrink-0" />
          )}

          {isActive && showContribute ? (
            <Button
              variant="contribute"
              size="sm"
              className="flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-semibold transition-all duration-200 border-0"
              onClick={handleContributeClick}
            >
              <Icon name="giveRSC" size={18} color="white" />
              Fund this research
            </Button>
          ) : onDetailsClick ? (
            <Button
              variant="outlined"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDetailsClick();
              }}
            >
              Details
            </Button>
          ) : null}
        </div>
      </div>

      {/* Contribute Modal */}
      <ContributeToFundraiseModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={handleContributeSuccess}
        fundraise={fundraise}
        proposalTitle={fundraiseTitle}
        work={work}
      />
    </>
  );
};
