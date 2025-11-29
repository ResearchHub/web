'use client';

import { FC, useState } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { Bounty, BountyContribution, BountyType, BountyWithComment } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { ContentFormat } from '@/types/comment';
import { BountyDetails } from '@/components/Feed/items/FeedItemBountyComment';

interface BountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
  contentFormat?: ContentFormat;
  bountyType: BountyType;
  totalAmount: number;
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
  totalAmount,
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
          amount={Math.round(totalAmount)}
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
  isAuthor?: boolean;
}

export const BountyInfo: FC<BountyInfoProps> = ({ bounty, relatedWork, onAddSolutionClick }) => {
  const bountyCommentContent = bounty?.comment?.content;
  const bountyCommentContentFormat = bounty?.comment?.contentFormat;
  const { showUSD } = useCurrencyPreference();
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
          ? parseFloat(contribution.amount) || 0
          : contribution.amount || 0,
    })) || [];

  // Get status display for deadline
  const getStatusDisplay = () => {
    if (!isActive) {
      return <div className="text-base text-gray-500 font-semibold">Closed</div>;
    }
    if (deadline) {
      return (
        <div className="flex items-center gap-1 text-gray-700 font-semibold">
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
      return 'Answer';
    }
    if (bounty.bountyType === 'REVIEW') {
      return 'Review';
    }

    return 'Add Solution';
  };

  // Get total amount in RSC
  const totalAmount = bounty.totalAmount ? parseFloat(bounty.totalAmount) : 0;

  // Get contributor count text
  const getContributorText = () => {
    const count = contributors.length;
    return `${count} ${count === 1 ? 'Contributor' : 'Contributors'}`;
  };

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
    <div className="bg-primary-50 rounded-lg p-3 border border-primary-100 cursor-default">
      {/* Top Section: Total Amount and Deadline */}
      <div
        className={`flex flex-row flex-wrap items-start justify-between ${isStateUnknown ? 'mb-0' : 'mb-2'}`}
      >
        {/* Total Amount */}
        <div className="text-left sm:!order-1 order-2 flex sm:!block justify-between w-full sm:!w-auto items-center">
          <span className="text-gray-500 text-sm mb-0.5 inline-block">{bountyTitle}</span>
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
            <span className="block text-gray-500 text-sm mb-0.5 inline-block">Deadline</span>
            {getStatusDisplay()}
          </div>
        ) : (
          <div className="sm:!order-2 order-1 self-center">
            <Button variant="outlined" size="md" onClick={handleDetailsClick}>
              Details
            </Button>
          </div>
        )}
      </div>

      {/* Bottom Section: Contributors and CTA Buttons */}
      {!isStateUnknown && (
        <div className="flex items-center justify-between gap-2 border-t border-primary-200 pt-2">
          {/* Contributors */}
          {contributors.length > 0 && (
            <div className={cn('flex justify-center mobile:!justify-end')}>
              <span className="text-sm text-gray-700">{getContributorText()}</span>
            </div>
          )}

          {contributors.length === 0 && <div className="flex-shrink-0"></div>}

          {/* CTA Buttons */}
          <div className="flex items-center gap-2">
            <Button variant="outlined" size="md" onClick={handleDetailsClick}>
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

      {/* Bounty Details Modal */}
      {bountyCommentContent && (
        <BountyDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          title={'Bounty Details'}
          content={bountyCommentContent}
          contentFormat={bountyCommentContentFormat}
          bountyType={bounty.bountyType as BountyType}
          totalAmount={totalAmount}
          showUSD={showUSD}
          onAddSolutionClick={onAddSolutionClick}
          buttonText={getAddButtonText()}
          isActive={isActive}
        />
      )}
    </div>
  );
};
