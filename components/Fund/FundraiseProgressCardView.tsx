'use client';

import { FC } from 'react';
import { Progress } from '@/components/ui/Progress';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { formatDeadline, isDeadlineInFuture } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface FundraiseProgressCardViewProps {
  fundraise: Fundraise;
  className?: string;
}

export const FundraiseProgressCardView: FC<FundraiseProgressCardViewProps> = ({
  fundraise,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();

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

  const getProgressVariant = () => {
    if (fundraise.status === 'COMPLETED') {
      return 'success';
    } else if (isEnded) {
      return 'gray';
    }
    return 'default';
  };

  return (
    <div className={cn(className)}>
      {/* Stats row with labels */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-4 sm:gap-8 min-w-0 flex-1">
          {/* Amount Raised */}
          <div className="flex flex-col flex-shrink-0">
            <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wide mb-0.5">
              Raised
            </span>
            <span
              className={`text-base sm:text-lg font-bold ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
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
          {deadlineText && !isEnded && <div className="hidden sm:block w-px h-8 bg-gray-200" />}

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
          {contributors.length > 0 && <div className="hidden sm:block w-px h-8 bg-gray-200" />}

          {/* Funders with AvatarStack */}
          {contributors.length > 0 && (
            <div className="hidden sm:flex flex-col flex-shrink-0">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Funders</span>
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
                <span className="text-base font-semibold text-gray-800">{contributors.length}</span>
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
              <span className="text-xs font-medium text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full">
                Open
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <Progress value={progressPercentage} variant={getProgressVariant()} size="sm" />
    </div>
  );
};
