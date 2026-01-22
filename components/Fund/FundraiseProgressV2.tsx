'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline, formatExactTime, isDeadlineInFuture, formatDate } from '@/utils/date';
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

  // Get status display for the non-compact view
  const getStatusDisplay = () => {
    switch (fundraise.status) {
      case 'COMPLETED':
        return (
          <div className="text-sm text-green-500 font-semibold">
            <span className="hidden mobile:!inline">Fundraise </span>Completed
          </div>
        );
      case 'CLOSED':
        return (
          <div className="text-sm text-gray-500 font-bold">
            <span className="hidden mobile:!inline">Fundraise </span>Closed
          </div>
        );
      case 'OPEN':
        if (isEnded) {
          return <div className="text-sm text-gray-500 font-bold">Ended</div>;
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
              <Clock className="h-4 w-4 cursor-help" />
            </Tooltip>
            <span className="text-sm">{deadlineText}</span>
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
            {/* Main row: Amount + Status + Contributors + Buttons */}
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Amount raised / goal */}
                <div className="flex items-center gap-0.5">
                  <CurrencyBadge
                    amount={Math.round(fundraise.amountRaised.rsc)}
                    variant="text"
                    size="md"
                    showText={false}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="p-0 gap-0"
                    textColor={isActive ? 'text-primary-700' : 'text-gray-600'}
                    fontWeight="font-bold"
                    showExchangeRate={false}
                    iconColor={isActive ? colors.primary[600] : colors.gray[500]}
                    iconSize={18}
                    shorten={false}
                  />
                  <span className="text-xs text-gray-500 mx-0.5">/</span>
                  <CurrencyBadge
                    amount={Math.round(fundraise.goalAmount.rsc)}
                    variant="text"
                    size="md"
                    showText={true}
                    currency={showUSD ? 'USD' : 'RSC'}
                    textColor="text-gray-500"
                    fontWeight="font-medium"
                    className="p-0 gap-0"
                    showExchangeRate={false}
                    iconColor={colors.gray[400]}
                    iconSize={16}
                    shorten={false}
                  />
                </div>

                {/* Deadline - hidden on mobile */}
                {fundraise.endDate && isActive && (
                  <div className="hidden sm:!flex items-center gap-1.5 text-xs text-gray-500">
                    <Clock size={14} className="text-gray-400" />
                    <span className="whitespace-nowrap">Ends {formatDate(fundraise.endDate)}</span>
                  </div>
                )}

                {/* Status badges */}
                {fundraise.status === 'COMPLETED' && (
                  <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                    Completed
                  </span>
                )}
                {fundraise.status === 'CLOSED' && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    Closed
                  </span>
                )}
                {fundraise.status === 'OPEN' && isEnded && (
                  <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
                    Ended
                  </span>
                )}
                {isActive && (
                  <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                    Open
                  </span>
                )}

                {/* Contributors inline (hidden on mobile) */}
                {contributors.length > 0 && (
                  <div className="cursor-pointer hidden sm:!flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors">
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
                      showExtraCount={false}
                      totalItemsCount={contributors.length}
                      extraCountLabel="Funders"
                      showLabel={false}
                    />
                    <span className="text-xs text-gray-600 whitespace-nowrap">
                      {contributors.length} {contributors.length === 1 ? 'Funder' : 'Funders'}
                    </span>
                  </div>
                )}
              </div>

              {/* CTA Buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {isActive ? (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleContributeClick}
                    className="bg-primary-600 hover:bg-primary-700 text-white !py-1.5 !px-2.5"
                  >
                    <span className="text-xs font-medium">Fund</span>
                  </Button>
                ) : onDetailsClick ? (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDetailsClick();
                    }}
                    className="!py-1.5 !px-2.5 text-gray-600 hover:text-gray-800"
                  >
                    <span className="text-xs font-medium">Details</span>
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={progressPercentage} variant={getProgressVariant()} size="xs" />
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
                <div className="flex justify-center mobile:!justify-end">
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
        proposalTitle={fundraiseTitle}
      />
    </>
  );
};
