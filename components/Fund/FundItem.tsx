'use client';

import { useState } from 'react';
import { Progress } from '@/components/ui/Progress';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Clock } from 'lucide-react';
import { formatDeadline } from '@/utils/date';
import type { AuthorProfile } from '@/types/authorProfile';
import { FundResearchModal } from '@/components/modals/FundResearchModal';

interface FundItemProps {
  id: number;
  status: 'OPEN' | 'COMPLETED' | 'CLOSED';
  amount: number;
  goalAmount: number;
  deadline: string;
  contributors?: Array<{
    profile: AuthorProfile;
    amount: number;
  }>;
  variant?: 'default' | 'compact';
  // Props needed for modal
  title: string;
  nftRewardsEnabled?: boolean;
  nftImageSrc?: string;
}

export function FundItem({
  id,
  status,
  amount,
  goalAmount,
  deadline,
  contributors = [],
  variant = 'default',
  // Modal props
  title,
  nftRewardsEnabled = false,
  nftImageSrc,
}: FundItemProps) {
  const [showFundModal, setShowFundModal] = useState(false);
  const deadlineText = formatDeadline(deadline);
  const isCompact = variant === 'compact';

  const handleContribute = () => {
    setShowFundModal(true);
  };

  const getStatusDisplay = () => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-green-500 font-medium`}>
            Fundraise Completed
          </span>
        );
      case 'CLOSED':
        return (
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 font-medium`}>
            Fundraise Closed
          </span>
        );
      case 'OPEN':
        return deadlineText === 'Ended' ? (
          <span className={`${isCompact ? 'text-xs' : 'text-sm'} text-gray-500 font-medium`}>
            Fundraise Ended
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-800">
            <Clock className={isCompact ? 'h-3 w-3' : 'h-4 w-4'} />
            <span className={isCompact ? 'text-xs' : 'text-sm'}>{deadlineText}</span>
          </div>
        );
      default:
        return null;
    }
  };

  const containerClasses = isCompact
    ? 'p-4 bg-white rounded-lg border border-gray-200'
    : 'mb-8 bg-white rounded-lg border border-gray-200 p-6';

  return (
    <>
      <div className={containerClasses}>
        <div className={isCompact ? 'mb-4' : 'mb-6'}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ResearchCoinIcon size={isCompact ? 14 : 20} outlined />
              <span className={`font-medium text-orange-500 ${isCompact ? 'text-xs' : 'text-lg'}`}>
                {amount.toLocaleString()} RSC raised
              </span>
              <span className={`text-gray-500 ${isCompact ? 'text-xs' : 'text-lg'}`}>
                of {goalAmount.toLocaleString()} RSC goal
              </span>
            </div>
            {getStatusDisplay()}
          </div>
          <Progress
            value={(amount / goalAmount) * 100}
            variant={status === 'COMPLETED' ? 'success' : 'default'}
            className={isCompact ? 'h-2' : 'h-3'}
          />
        </div>

        <div className="flex items-center justify-between">
          <Button
            variant="contribute"
            size={isCompact ? 'sm' : 'lg'}
            disabled={status !== 'OPEN' || deadlineText === 'Ended'}
            className="flex items-center gap-1.5"
            onClick={handleContribute}
          >
            <ResearchCoinIcon size={isCompact ? 16 : 20} contribute />
            Fund this research
          </Button>
          {contributors.length > 0 && (
            <ContributorsButton
              contributors={contributors}
              onContribute={handleContribute}
              label={`${contributors.length} Funders`}
            />
          )}
        </div>
      </div>

      {showFundModal && (
        <FundResearchModal
          isOpen={showFundModal}
          onClose={() => setShowFundModal(false)}
          title={title}
          nftRewardsEnabled={nftRewardsEnabled}
          nftImageSrc={nftImageSrc}
          fundraiseId={id}
        />
      )}
    </>
  );
}
