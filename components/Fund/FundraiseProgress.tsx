'use client';

import { FC } from 'react';
import { Progress } from '@/components/ui/Progress';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import type { Fundraise } from '@/types/funding';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';
import { RSCBadge } from '@/components/ui/RSCBadge';

interface FundraiseProgressProps {
  fundraise: Fundraise;
  compact?: boolean;
  onContribute?: () => void;
  showContribute?: boolean;
  className?: string;
}

export const FundraiseProgress: FC<FundraiseProgressProps> = ({
  fundraise,
  compact = false,
  onContribute,
  showContribute = true,
  className,
}) => {
  if (!fundraise) return null;

  const deadlineText = fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined;

  // Calculate progress percentage with a minimum of 5% for visibility
  const progressPercentage = Math.max(
    0,
    Math.min(100, Math.max(5, (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100))
  );

  // Extract contributors if available
  const contributors =
    fundraise.contributors?.topContributors?.map((contributor) => ({
      profile: contributor,
      amount: 0, // We don't have individual contribution amounts in the current data model
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
            Fundraise Ended
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

  const defaultContainerClasses = compact
    ? 'p-3 bg-white rounded-lg border border-gray-200'
    : 'p-4 bg-white rounded-lg border border-gray-200';

  if (compact) {
    // Compact mode with RSCBadge style
    return (
      <div className={cn(defaultContainerClasses, className)}>
        {/* Top row: Amount on left, contributors on right */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <RSCBadge
              amount={fundraise.amountRaised.rsc}
              variant="text"
              size="xs"
              showText={false}
            />
            <span className="font-medium text-gray-700 mx-0.5">/</span>
            <RSCBadge amount={fundraise.goalAmount.rsc} variant="text" size="xs" showText={true} />
          </div>

          {contributors.length > 0 ? (
            <div className="-mr-1">
              <ContributorsButton
                contributors={contributors}
                onContribute={onContribute}
                hideLabel={false}
                label={`${fundraise.contributors.numContributors} Funders`}
                size="sm"
              />
            </div>
          ) : (
            getStatusDisplay()
          )}
        </div>

        {/* Progress bar */}
        <Progress
          value={progressPercentage}
          variant={fundraise.status === 'COMPLETED' ? 'success' : 'default'}
          className="h-2 mb-2"
        />

        {/* Bottom row: Fund CTA on left */}
        {showContribute && (
          <div className="flex items-center">
            <Button
              variant="contribute"
              size="sm"
              disabled={!isActive}
              className="flex items-center gap-1.5"
              onClick={onContribute}
            >
              <ResearchCoinIcon size={16} contribute />
              Fund this research
            </Button>
          </div>
        )}
      </div>
    );
  } else {
    // Default mode with original style
    return (
      <div className={cn(defaultContainerClasses, className)}>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ResearchCoinIcon size={20} outlined />
              <span className="font-medium text-orange-500 text-lg">
                {fundraise.amountRaised.rsc.toLocaleString()} RSC raised
              </span>
              <span className="text-gray-500 text-lg">
                of {fundraise.goalAmount.rsc.toLocaleString()} RSC goal
              </span>
            </div>
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
              onClick={onContribute}
            >
              <ResearchCoinIcon size={20} contribute />
              Fund this research
            </Button>
          )}

          {contributors.length > 0 && (
            <div className={showContribute ? '' : 'ml-auto'}>
              <ContributorsButton
                contributors={contributors}
                onContribute={onContribute}
                label={`${fundraise.contributors.numContributors} Funders`}
                size="md"
              />
            </div>
          )}
        </div>
      </div>
    );
  }
};
