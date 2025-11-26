'use client';

import { FC } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ContributorsButton } from '@/components/ui/ContributorsButton';
import { Button } from '@/components/ui/Button';
import { formatDate, formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { Bounty, BountyContribution } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { MessageSquareReply } from 'lucide-react';

interface BountyInfoProps {
  bounty: Bounty;
  relatedWork?: Work;
  onAddSolutionClick: (e: React.MouseEvent) => void;
  isAuthor?: boolean;
  className?: string;
}

export const BountyInfo: FC<BountyInfoProps> = ({
  bounty,
  relatedWork,
  onAddSolutionClick,
  className,
}) => {
  const { showUSD } = useCurrencyPreference();

  // Check if bounty is active
  const isActive =
    bounty.status === 'OPEN' &&
    (bounty.expirationDate ? isDeadlineInFuture(bounty.expirationDate) : true);
  const deadline = bounty.expirationDate ? formatDate(bounty.expirationDate) : undefined;

  // Prepare contributors data for ContributorsButton
  const contributors =
    bounty.contributions?.map((contribution: BountyContribution) => ({
      profile: {
        profileImage: contribution.createdBy?.authorProfile?.profileImage,
        fullName: contribution.createdBy?.authorProfile?.fullName || 'Anonymous',
        id: contribution.createdBy?.authorProfile?.id || 0,
      },
      amount:
        typeof contribution.amount === 'string'
          ? parseFloat(contribution.amount) || 0
          : contribution.amount || 0,
    })) || [];

  // Get status display for deadline
  const getStatusDisplay = () => {
    if (!isActive) {
      return <div className="text-lg text-gray-500 font-semibold">Closed</div>;
    }
    if (deadline) {
      return (
        <div className="flex items-center gap-1.5 text-gray-700 font-semibold">
          <span className="text-lg">{deadline}</span>
        </div>
      );
    }
    return null;
  };

  // On the Overview page, we can't fetch real Bounty status or endDate,
  // as a workaround we use the isActive and deadline to determine the unknown state
  const isStateUnknown = isActive && !deadline;

  // Get bounty title text
  const bountyTitle = bounty.bountyType === 'REVIEW' ? 'Peer Review Bounty for' : 'Bounty for';

  // Get button text for Add Solution/Review
  const getAddButtonText = () => {
    if (relatedWork?.postType === 'QUESTION') {
      return 'Answer';
    }
    if (bounty.bountyType === 'REVIEW') {
      return 'Review';
    }

    return 'Add Solution';
  };

  // Get total amount in RSC
  const totalAmount = bounty.totalAmount ? parseFloat(bounty.totalAmount) : 0;

  return (
    <div className="bg-primary-50 rounded-lg p-4 border border-primary-100 cursor-default">
      {/* Top Section: Total Amount and Deadline */}
      <div
        className={`flex flex-row flex-wrap items-start justify-between ${isStateUnknown ? 'mb-0' : 'mb-3'}`}
      >
        {/* Total Amount */}
        <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
          <span className="text-gray-500 text-base mb-1 inline-block">{bountyTitle}</span>
          <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
            <CurrencyBadge
              amount={Math.round(totalAmount)}
              variant="text"
              size="xl"
              showText={true}
              currency={showUSD ? 'USD' : 'RSC'}
              className="p-0 gap-0"
              textColor="text-gray-700"
              showExchangeRate={false}
              iconColor={colors.gray[700]}
              iconSize={24}
              shorten
            />
          </div>
        </div>

        {/* Deadline */}
        {!isStateUnknown ? (
          <div className="flex-shrink-0 whitespace-nowrap text-left sm:!text-right sm:!order-2 order-1 sm:!block flex justify-between w-full sm:!w-auto items-center">
            <span className="block text-gray-500 text-base mb-1 inline-block">Deadline</span>
            {getStatusDisplay()}
          </div>
        ) : (
          <div className="sm:!order-2 order-1 self-center">
            <Button variant="outlined" size="md" onClick={onAddSolutionClick}>
              Details
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Section: Contributors and CTA Buttons */}
      {!isStateUnknown && (
        <div className="flex items-center justify-between gap-3 border-t border-primary-200 pt-3">
          {/* Contributors */}
          {contributors.length > 0 && (
            <div className={cn('flex justify-center mobile:!justify-end')}>
              <ContributorsButton
                contributors={contributors}
                onContribute={() => {}}
                label="Contributors"
                size="md"
                disableContribute={false}
                variant="count"
                customOnClick={() => {}}
              />
            </div>
          )}

          {contributors.length === 0 && <div className="flex-shrink-0"></div>}

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="md" onClick={onAddSolutionClick}>
              Details
            </Button>
            {isActive && (
              <Button
                variant="default"
                size="md"
                onClick={onAddSolutionClick}
                className="flex items-center gap-2"
              >
                {getAddButtonText()}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
