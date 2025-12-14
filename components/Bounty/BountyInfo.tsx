'use client';

import { FC, useState, useMemo } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatDate, isDeadlineInFuture } from '@/utils/date';
import { Bounty, BountyType } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContentFormat } from '@/types/comment';
import { BountyDetails } from '@/components/Feed/items/FeedItemBountyComment';
import { Clock, Forward, ArrowLeft } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/pro-light-svg-icons';
import { getBountyDisplayAmount } from './lib/bountyUtil';
import { DeadlineExactTimeTooltip } from '@/components/ui/DeadlineExactTimeTooltip';

interface BountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
  contentFormat?: ContentFormat;
  bountyType: BountyType;
  displayAmount: number;
  showUSD: boolean;
  deadline?: string;
  deadlineIso?: string;
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
  deadline,
  deadlineIso,
  onAddSolutionClick,
  buttonText,
  isActive,
}) => {
  const handleCTAClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddSolutionClick(e);
    onClose();
  };

  const footerContent = isActive ? (
    <Button
      variant="default"
      size="lg"
      onClick={handleCTAClick}
      className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white"
    >
      <Forward size={18} />
      <span>{buttonText}</span>
    </Button>
  ) : undefined;

  // Mobile: back arrow + icon, Desktop: just icon
  const headerAction = (
    <div className="flex items-center">
      {/* Back arrow - mobile only */}
      <div className="md:!hidden -ml-2">
        <Button onClick={onClose} variant="ghost" size="icon" aria-label="Go back">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </Button>
      </div>
      <FontAwesomeIcon icon={faCircleInfo} className="h-5 w-5 text-orange-500" />
    </div>
  );

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-xl"
      headerAction={headerAction}
      footer={footerContent}
      className="md:!min-w-[500px] md:!min-h-[400px]"
    >
      {/* Summary info */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">Amount:</span>
          <CurrencyBadge
            amount={Math.round(displayAmount)}
            variant="text"
            size="lg"
            showText={true}
            currency={showUSD ? 'USD' : 'RSC'}
            className="p-0 gap-0"
            textColor="text-gray-900"
            fontWeight="font-bold"
            showExchangeRate={false}
            iconColor={colors.gray[700]}
            iconSize={20}
            shorten
            skipConversion={showUSD}
          />
        </div>
        {deadline && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            <DeadlineExactTimeTooltip deadlineIso={deadlineIso}>
              <span>Ends {deadline}</span>
            </DeadlineExactTimeTooltip>
          </div>
        )}
      </div>

      {/* Bounty details content */}
      {content ? (
        <BountyDetails content={content} contentFormat={contentFormat} bountyType={bountyType} />
      ) : (
        <p className="text-gray-500 text-sm">No additional details provided for this bounty.</p>
      )}
    </BaseModal>
  );
};

interface BountyInfoProps {
  bounty: Bounty;
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

  // Get bounty label text
  const bountyLabel = bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty';

  // Get button text for Add Solution/Review
  const getAddButtonText = () => {
    if (relatedWork?.postType === 'QUESTION') {
      return 'Answer';
    }
    if (bounty.bountyType === 'REVIEW') {
      return 'Add Review';
    }
    return 'Solve';
  };

  // Get display amount (handles Foundation bounties with flat $150 USD)
  const { amount: displayAmount } = useMemo(
    () => getBountyDisplayAmount(bounty, exchangeRate, showUSD),
    [bounty, exchangeRate, showUSD]
  );

  // Handler for details button click - always open modal
  const handleDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-between gap-3 px-3 py-2 rounded-lg',
          isActive
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200'
            : 'bg-gray-50 border border-gray-200',
          className
        )}
      >
        {/* Left side: Label + Amount + Deadline */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Bounty Label & Amount */}
          <div className="flex items-center gap-2">
            {/* Label badge - hidden on mobile */}
            <span
              className={cn(
                'hidden sm:!inline-block text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap',
                isActive ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
              )}
            >
              {bountyLabel}
            </span>
            <CurrencyBadge
              amount={Math.round(displayAmount)}
              variant="text"
              size="md"
              showText={true}
              currency={showUSD ? 'USD' : 'RSC'}
              className="p-0 gap-0"
              textColor={isActive ? 'text-orange-700' : 'text-gray-600'}
              fontWeight="font-bold"
              showExchangeRate={false}
              iconColor={isActive ? '#ea580c' : colors.gray[500]}
              iconSize={18}
              shorten
              skipConversion={showUSD}
            />
          </div>

          {/* Deadline - hidden on very small screens */}
          {deadline && (
            <div
              className={cn(
                'hidden sm:!flex items-center gap-1 text-xs',
                isActive ? 'text-gray-600' : 'text-gray-500'
              )}
            >
              <Clock size={12} className="flex-shrink-0" />
              <DeadlineExactTimeTooltip deadlineIso={bounty.expirationDate}>
                <span className="whitespace-nowrap">Ends {deadline}</span>
              </DeadlineExactTimeTooltip>
            </div>
          )}

          {!isActive && (
            <span className="text-xs font-medium text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full">
              Closed
            </span>
          )}
        </div>

        {/* Right side: Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="outlined"
            size="sm"
            onClick={handleDetailsClick}
            className="flex items-center gap-1.5 !py-1.5 !px-2.5 text-gray-600 hover:text-gray-800"
          >
            <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5 text-gray-700" />
            <span className="text-xs font-medium">Details</span>
          </Button>
          {isActive && (
            <Button
              variant="default"
              size="sm"
              onClick={onAddSolutionClick}
              className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white !py-1.5 !px-2.5"
            >
              <Forward size={14} />
              <span className="text-xs font-medium">{getAddButtonText()}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Bounty Details Modal - always render, controlled by isOpen */}
      <BountyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={'Bounty Details'}
        content={bountyCommentContent}
        contentFormat={bountyCommentContentFormat}
        bountyType={bounty.bountyType as BountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadline={deadline}
        deadlineIso={bounty.expirationDate}
        onAddSolutionClick={onAddSolutionClick}
        buttonText={getAddButtonText()}
        isActive={isActive}
      />
    </>
  );
};
