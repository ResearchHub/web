'use client';

import { FC, useState, useMemo } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { BountyContribution, BountyType, BountyWithComment } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { StatusCard } from '@/components/ui/StatusCard';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContentFormat } from '@/types/comment';
import { BountyDetails } from '@/components/Feed/items/FeedItemBountyComment';
import { MessageSquareReply } from 'lucide-react';
import { getBountyDisplayAmount } from './lib/bountyUtil';

interface BountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
  contentFormat?: ContentFormat;
  bountyType: BountyType;
  displayAmount: number;
  showUSD: boolean;
  onAddSolutionClick: (e: React.MouseEvent) => void;
  buttonText: string;
  isActive: boolean;
}

const BountyDetailsModal: FC<BountyDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  contentFormat,
  bountyType,
  displayAmount,
  showUSD,
  onAddSolutionClick,
  buttonText,
  isActive,
}) => {
  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSolutionClick(e);
    onClose();
  };

  const footer = (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-600 text-sm font-medium">Total Amount:</span>
        <CurrencyBadge
          amount={Math.round(displayAmount)}
          variant="text"
          size="lg"
          showText={true}
          currency={showUSD ? 'USD' : 'RSC'}
          className="p-0 gap-0"
          textColor="text-gray-900"
          showExchangeRate={false}
          iconColor={colors.gray[700]}
          iconSize={20}
          shorten
          skipConversion={showUSD}
        />
      </div>
      {isActive && (
        <Button variant="default" size="md" onClick={handleCTAClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      padding="p-6"
      maxWidth="max-w-xl"
      className="md:!min-w-[600px]"
      footer={footer}
    >
      <BountyDetails content={content} contentFormat={contentFormat} bountyType={bountyType} />
    </BaseModal>
  );
};

interface BountyInfoProps {
  bounty: BountyWithComment;
  relatedWork?: Work;
  onAddSolutionClick: (e: React.MouseEvent) => void;
  className?: string;
}

export const BountyInfo: FC<BountyInfoProps> = ({
  bounty,
  relatedWork,
  onAddSolutionClick,
  className,
}) => {
  const bountyCommentContent = bounty?.comment?.content;
  const bountyCommentContentFormat = bounty?.comment?.contentFormat;
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Check if bounty is active
  const isActive =
    bounty.status === 'OPEN' &&
    (bounty.expirationDate ? isDeadlineInFuture(bounty.expirationDate) : true);
  const deadline = bounty.expirationDate ? formatDate(bounty.expirationDate) : undefined;

  // Prepare contributors data for count display
  const contributors =
    bounty.contributions?.map((contribution: BountyContribution) => ({
      profile: {
        profileImage: contribution.createdBy?.authorProfile?.profileImage,
        fullName: contribution.createdBy?.authorProfile?.fullName || 'Anonymous',
        id: contribution.createdBy?.authorProfile?.id || 0,
      },
      amount:
        typeof contribution.amount === 'string'
          ? Number.parseFloat(contribution.amount) || 0
          : contribution.amount || 0,
    })) || [];

  // Get status display for deadline
  const getStatusDisplay = () => {
    if (!isActive) {
      return <div className="text-sm text-gray-500 font-bold">Closed</div>;
    }
    if (deadline) {
      return (
        <div className="flex items-center gap-1 text-gray-700 font-bold">
          <span className="text-base">{deadline}</span>
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
      return 'Add Answer';
    }
    if (bounty.bountyType === 'REVIEW') {
      return 'Add Review';
    }

    return 'Add Solution';
  };

  // Get display amount (handles Foundation bounties with flat $150 USD)
  const { amount: displayAmount } = useMemo(
    () => getBountyDisplayAmount(bounty, exchangeRate, showUSD),
    [bounty, exchangeRate, showUSD]
  );

  // Handler for details button click
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (bountyCommentContent) {
      setIsDetailsModalOpen(true);
    } else {
      onAddSolutionClick(e);
    }
  };

  return (
    <>
      <StatusCard variant={isActive ? 'orange' : 'inactive'} className={className}>
        {/* Top Section: Total Amount and Deadline */}
        <div
          className={`flex flex-row flex-wrap items-start justify-between ${isStateUnknown ? 'mb-0' : 'mb-2'}`}
        >
          {/* Total Amount */}
          <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
            <span className="text-gray-500 text-sm mb-0.5 inline-block">{bountyTitle}</span>
            <div className="flex items-center flex-wrap min-w-0 truncate font-semibold">
              <CurrencyBadge
                amount={Math.round(displayAmount)}
                variant="text"
                size="xl"
                showText={true}
                currency={showUSD ? 'USD' : 'RSC'}
                className="p-0 gap-0"
                textColor="text-gray-700"
                fontWeight="font-bold"
                showExchangeRate={false}
                iconColor={colors.gray[700]}
                iconSize={24}
                shorten
                skipConversion={showUSD}
              />
            </div>
          </div>

          {/* Deadline */}
          {isStateUnknown ? (
            <div className="sm:!order-2 order-1 self-center">
              <Button variant="outlined" size="sm" onClick={handleDetailsClick}>
                Details
              </Button>
            </div>
          ) : (
            <div className="flex-shrink-0 whitespace-nowrap text-left sm:!text-right sm:!order-2 order-1 sm:!block flex justify-between w-full sm:!w-auto items-center">
              {isActive && (
                <span className="block text-gray-500 text-sm mb-0.5 inline-block">Deadline</span>
              )}
              {getStatusDisplay()}
            </div>
          )}
        </div>

        {/* Bottom Section: Contributors and CTA Buttons */}
        {!isStateUnknown && (
          <div
            className={cn(
              'flex items-center justify-between gap-2 border-t pt-2',
              isActive ? 'border-orange-300' : 'border-gray-200'
            )}
          >
            {/* Contributors */}
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
                  extraCountLabel="Contributors"
                  showLabel={false}
                />
              </div>
            )}

            {contributors.length === 0 && <div className="flex-shrink-0"></div>}

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="outlined" size="sm" onClick={handleDetailsClick}>
                Details
              </Button>
              {isActive && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAddSolutionClick}
                  className="flex items-center gap-2 bg-orange-400 hover:bg-orange-500 text-white"
                >
                  <MessageSquareReply size={16} />
                  {getAddButtonText()}
                </Button>
              )}
            </div>
          </div>
        )}
      </StatusCard>

      {/* Bounty Details Modal */}
      {bountyCommentContent && (
        <BountyDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={'Bounty Details'}
          content={bountyCommentContent}
          contentFormat={bountyCommentContentFormat}
          bountyType={bounty.bountyType as BountyType}
          displayAmount={displayAmount}
          showUSD={showUSD}
          onAddSolutionClick={onAddSolutionClick}
          buttonText={getAddButtonText()}
          isActive={isActive}
        />
      )}
    </>
  );
};
