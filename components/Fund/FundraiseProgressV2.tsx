'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline, formatExactTime, isDeadlineInFuture } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { Icon } from '../ui/icons';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { useRouter } from 'next/navigation';
import { Tooltip } from '@/components/ui/Tooltip';
import { StatusCard } from '@/components/ui/StatusCard';
import { colors } from '@/app/styles/colors';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
  compact?: boolean;
  onContribute?: () => void;
  className?: string;
  onDetailsClick?: () => void;
}

export const FundraiseProgress: FC<FundraiseProgressProps> = ({
  fundraise,
  fundraiseTitle,
  compact = false,
  onContribute,
  className,
  onDetailsClick,
}) => {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();

  if (!fundraise) return null;

  const deadlineText = fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined;
  const isEnded = deadlineText?.includes('Ended');
  const isActive =
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);

  // Calculate progress percentage with a minimum of 5% for visibility
  const progressPercentage =
    fundraise.status === 'COMPLETED'
      ? 100
      : Math.max(
          0,
          Math.min(100, Math.max(5, (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100))
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

  // Get status display for the top right when no contributors
  const getStatusDisplay = () => {
    switch (fundraise.status) {
      case 'COMPLETED':
        return (
          <div className={`text-sm text-green-500 font-semibold`}>
            <span className="hidden mobile:!inline">Fundraise </span>Completed
          </div>
        );
      case 'CLOSED':
        return (
          <div className={`text-sm text-gray-500 font-bold`}>
            <span className="hidden mobile:!inline">Fundraise </span>Closed
          </div>
        );
      case 'OPEN':
        if (isEnded) {
          return <div className={`text-sm text-gray-500 font-bold`}>Ended</div>;
        }
        if (!deadlineText || !fundraise.endDate) {
          return null;
        }
        return (
          <div className="flex items-center gap-1 text-gray-700 font-bold">
            <Tooltip
              content={formatExactTime(fundraise.endDate)}
              position="top"
              width="w-48"
              wrapperClassName="items-center"
            >
              <Clock className={`${compact ? 'h-5 w-5' : 'h-4 w-4'} cursor-help`} />
            </Tooltip>
            <span className={`${compact ? 'text-base' : 'text-sm'}`}>{deadlineText}</span>
          </div>
        );
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

  const getProgressVariant = () => {
    if (fundraise.status === 'COMPLETED') {
      return 'success';
    } else if (isEnded) {
      return 'gray';
    }
    return 'default';
  };

  return (
    <>
      <StatusCard variant={isActive ? 'active' : 'inactive'}>
        {compact ? (
          <div className={cn(className)}>
            <div className="flex flex-row flex-wrap items-start justify-between mb-2">
              <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
                <span className="text-gray-500 text-sm mb-0.5 inline-block">Amount Raised</span>
                <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
                  <CurrencyBadge
                    amount={Math.round(fundraise.amountRaised.rsc)}
                    variant="text"
                    size="xl"
                    showText={false}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="p-0 gap-0"
                    textColor="text-gray-700"
                    fontWeight="font-bold"
                    showExchangeRate={false}
                    iconColor={colors.gray[700]}
                    iconSize={24}
                    shorten
                  />
                  <span className="font-semibold text-gray-700 mx-0.5 text-base px-1">/</span>
                  <CurrencyBadge
                    amount={Math.round(fundraise.goalAmount.rsc)}
                    variant="text"
                    size="xl"
                    showText={true}
                    currency={showUSD ? 'USD' : 'RSC'}
                    textColor="text-gray-700"
                    fontWeight="font-bold"
                    className="p-0 gap-0"
                    showExchangeRate={false}
                    iconColor={colors.gray[700]}
                    iconSize={24}
                    shorten
                  />
                </div>
              </div>

              <div className="flex-shrink-0 whitespace-nowrap text-left sm:!text-right sm:!order-2 order-1 sm:!block flex justify-between w-full sm:!w-auto items-center">
                {isActive && (
                  <span className="block text-gray-500 text-sm mb-0.5 inline-block">Deadline</span>
                )}
                {getStatusDisplay()}
              </div>
            </div>

            <div className="mb-2">
              <Progress value={progressPercentage} variant={getProgressVariant()} size="xs" />
            </div>

            <div className="flex items-center justify-between gap-2">
              {contributors.length > 0 && (
                <div className="cursor-pointer flex-shrink-0 flex items-center">
                  <AvatarStack
                    items={contributors.map((contributor) => ({
                      src: contributor.profile.profileImage || '',
                      alt: contributor.profile.fullName,
                      tooltip: contributor.profile.fullName,
                      authorId: contributor.profile.id,
                    }))}
                    size="xs"
                    maxItems={3}
                    spacing={-6}
                    showExtraCount={contributors.length > 3}
                    totalItemsCount={contributors.length}
                    extraCountLabel="Supporters"
                  />
                </div>
              )}

              {contributors.length === 0 && <div className="flex-shrink-0"></div>}

              {isActive ? (
                <Button
                  variant="default"
                  size="sm"
                  disabled={!isActive}
                  onClick={handleContributeClick}
                >
                  Fund
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
        ) : (
          <div className={cn(className)}>
            <div className="mb-6">
              <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between mb-4 mobile:!mb-3 gap-3 mobile:!gap-0">
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
                <div className="mobile:!flex-shrink-0">{getStatusDisplay()}</div>
              </div>
              <Progress value={progressPercentage} variant={getProgressVariant()} className="h-3" />
            </div>

            <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between gap-4 mobile:!gap-0">
              {isActive ? (
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
              ) : onDetailsClick ? (
                <Button
                  variant="outlined"
                  size="md"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDetailsClick();
                  }}
                >
                  Details
                </Button>
              ) : null}

              {contributors.length > 0 && (
                <div className={cn('flex justify-center mobile:!justify-end')}>
                  <ContributorsButton
                    contributors={contributors}
                    onContribute={handleContributeClick}
                    label={`Supporters`}
                    size="md"
                    disableContribute={!isActive}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </StatusCard>

      {/* Contribute Modal */}
      <ContributeToFundraiseModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={handleContributeSuccess}
        fundraise={fundraise}
      />
    </>
  );
};
