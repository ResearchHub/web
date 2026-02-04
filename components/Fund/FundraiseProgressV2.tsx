'use client';

import { FC, useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline, formatExactTime, isDeadlineInFuture, formatDate } from '@/utils/date';
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
import { StatusCard } from '@/components/ui/StatusCard';
import { colors } from '@/app/styles/colors';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  fundraiseTitle: string;
  compact?: boolean;
  onContribute?: () => void;
  className?: string;
  onDetailsClick?: () => void;
  /** Work object containing author information */
  work?: Work;
}

export const FundraiseProgress: FC<FundraiseProgressProps> = ({
  fundraise,
  fundraiseTitle,
  compact = false,
  onContribute,
  className,
  onDetailsClick,
  work,
}) => {
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);
  const { showUSD } = useCurrencyPreference();
  const { showShareModal } = useShareModalContext();
  const router = useRouter();
  const { executeAuthenticatedAction } = useAuthenticatedAction();

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
    executeAuthenticatedAction(() => {
      setIsContributeModalOpen(true);
      if (onContribute) {
        onContribute();
      }
    });
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
      <StatusCard variant={isActive ? 'orange' : 'inactive'}>
        {compact ? (
          <div className={cn(className)}>
            {/* Stats row with labels */}
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
                {/* Amount Raised */}
                <div className="flex flex-col flex-shrink-0">
                  <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                    Raised
                  </span>
                  <span
                    className={`text-base sm:text-lg font-bold ${isActive ? 'text-orange-600' : 'text-gray-500'}`}
                  >
                    {showUSD
                      ? `$${fundraise.amountRaised.usd >= 1000 ? `${(fundraise.amountRaised.usd / 1000).toFixed(0)}K` : fundraise.amountRaised.usd.toLocaleString()}`
                      : `${fundraise.amountRaised.rsc >= 1000 ? `${(fundraise.amountRaised.rsc / 1000).toFixed(0)}K` : fundraise.amountRaised.rsc.toLocaleString()} RSC`}
                  </span>
                </div>

                {/* Divider */}
                <div className="hidden sm:block w-px h-8 bg-gray-200" />

                {/* Goal */}
                <div className="hidden sm:flex flex-col flex-shrink-0">
                  <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Goal</span>
                  <span className="text-base font-semibold text-gray-800">
                    {showUSD
                      ? `$${fundraise.goalAmount.usd >= 1000 ? `${(fundraise.goalAmount.usd / 1000).toFixed(0)}K` : fundraise.goalAmount.usd.toLocaleString()}`
                      : `${fundraise.goalAmount.rsc >= 1000 ? `${(fundraise.goalAmount.rsc / 1000).toFixed(0)}K` : fundraise.goalAmount.rsc.toLocaleString()} RSC`}
                  </span>
                </div>

                {/* Divider */}
                {deadlineText && !isEnded && (
                  <div className="hidden sm:block w-px h-8 bg-gray-200" />
                )}

                {/* Days Left */}
                {deadlineText && !isEnded && isActive && (
                  <div className="hidden sm:flex flex-col flex-shrink-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                      Time Left
                    </span>
                    <span className="text-base font-semibold text-gray-800">{deadlineText}</span>
                  </div>
                )}

                {/* Divider */}
                {contributors.length > 0 && (
                  <div className="hidden sm:block w-px h-8 bg-gray-200" />
                )}

                {/* Funders with AvatarStack */}
                {contributors.length > 0 && (
                  <div className="hidden sm:flex flex-col flex-shrink-0">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">
                      Funders
                    </span>
                    <div className="flex items-center gap-2">
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
                      <span className="text-base font-semibold text-gray-800">
                        {contributors.length}
                      </span>
                    </div>
                  </div>
                )}

                {/* Mobile: Status badge */}
                <div className="sm:hidden flex-shrink-0">
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
                    <span className="text-xs font-medium text-orange-700 bg-orange-100 px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  )}
                </div>
              </div>

              {/* CTA Button */}
              <div className="flex items-center flex-shrink-0">
                <Button
                  variant="default"
                  size="sm"
                  onClick={isActive ? handleContributeClick : undefined}
                  disabled={!isActive}
                  className={`!py-2 !px-5 ${isActive ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                >
                  <span className="text-sm font-semibold">
                    {isActive ? 'Fund Proposal' : 'Closed'}
                  </span>
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <Progress value={progressPercentage} variant={getProgressVariant()} size="sm" />
          </div>
        ) : (
          <div className={cn(className)}>
            <div className="mb-6">
              <div className="flex flex-col mobile:!flex-row mobile:!items-center mobile:!justify-between mb-4 mobile:!mb-3 gap-3 mobile:!gap-0">
                <div className="flex items-center flex-wrap gap-1">
                  <CurrencyBadge
                    amount={
                      showUSD
                        ? Math.round(fundraise.amountRaised.usd)
                        : Math.round(fundraise.amountRaised.rsc)
                    }
                    variant="text"
                    size="md"
                    showText={false}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="font-medium text-orange-500 text-base mobile:!text-lg pl-0"
                    skipConversion={showUSD}
                  />
                  <span className="text-gray-500 text-base mobile:!text-lg">raised of</span>
                  <CurrencyBadge
                    amount={
                      showUSD
                        ? Math.round(fundraise.goalAmount.usd)
                        : Math.round(fundraise.goalAmount.rsc)
                    }
                    variant="text"
                    size="md"
                    showText={true}
                    showIcon={true}
                    currency={showUSD ? 'USD' : 'RSC'}
                    className="text-gray-500 text-base mobile:!text-lg"
                    skipConversion={showUSD}
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
        work={work}
      />
    </>
  );
};
