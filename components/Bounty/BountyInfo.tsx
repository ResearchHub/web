'use client';

import { FC, useMemo, useState } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { formatDate, formatDeadline, isDeadlineInFuture } from '@/utils/date';
import { isExpiringSoon } from './lib/bountyUtil';
import { Bounty, BountyType } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContentFormat } from '@/types/comment';
import { BountyDetails } from '@/components/Feed/items/FeedItemBountyComment';
import { Clock, Forward, ArrowLeft, ArrowRight } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/pro-solid-svg-icons';
import { getBountyDisplayAmount } from './lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';

export interface BountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: any;
  contentFormat?: ContentFormat;
  bountyType: BountyType;
  displayAmount: number;
  showUSD: boolean;
  deadlineLabel?: string;
  onAddSolutionClick: (e: React.MouseEvent) => void;
  buttonText: string;
  isActive: boolean;
}

export const BountyDetailsModal: FC<BountyDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  contentFormat,
  bountyType,
  displayAmount,
  showUSD,
  deadlineLabel,
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
      variant="dark"
      size="lg"
      onClick={handleCTAClick}
      className="w-full flex items-center justify-center gap-2"
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
      <FontAwesomeIcon icon={faCircleInfo} className="h-5 w-5 text-primary-500" />
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
        {deadlineLabel && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Clock size={14} />
            <span>{deadlineLabel}</span>
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
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  // Check if bounty is active (OPEN or ASSESSMENT)
  const isActive = useMemo(() => {
    if (bounty.status === 'OPEN') {
      return bounty.expirationDate ? isDeadlineInFuture(bounty.expirationDate) : true;
    }
    if (bounty.status === 'ASSESSMENT') {
      return true;
    }

    return false;
  }, [bounty.status, bounty.expirationDate]);

  // Compute deadline label: use hours format if <24h, else use date format
  const deadlineLabel = useMemo(() => {
    if (bounty.status === 'ASSESSMENT') {
      return 'Assessment Period';
    }

    if (!bounty.expirationDate) return undefined;

    // If <24h remaining, use formatDeadline which returns "Ends in Xh" or "Ends in Xm"
    if (isExpiringSoon(bounty.expirationDate, 1)) {
      return formatDeadline(bounty.expirationDate);
    }

    // Otherwise, use date format with "Ends" prefix
    return `Ends ${formatDate(bounty.expirationDate)}`;
  }, [bounty.status, bounty.expirationDate]);

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

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailsModalOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          'mt-3 rounded-lg bg-gray-50/90 border border-gray-100 px-4 py-3.5 cursor-default',
          className
        )}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-6 min-w-0">
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="text-xs text-gray-500 uppercase tracking-wide">{bountyLabel}</span>
              <span className="font-mono font-semibold text-primary-600 text-xl">
                {formatCurrency({
                  amount: Math.round(displayAmount),
                  showUSD,
                  exchangeRate,
                  skipConversion: showUSD,
                  shorten: true,
                })}
              </span>
            </div>

            {deadlineLabel && (
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Deadline</span>
                <div className="flex items-center gap-1.5">
                  <Clock size={14} className="text-gray-500 flex-shrink-0" />
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {deadlineLabel}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outlined"
              size="sm"
              className="flex-shrink-0 rounded-md text-[13px] gap-1.5 text-gray-600 hover:text-gray-800"
              onClick={handleDetailsClick}
            >
              <FontAwesomeIcon icon={faCircleInfo} className="h-3.5 w-3.5" />
              Details
            </Button>
            {isActive ? (
              <Button
                variant="dark"
                size="sm"
                className="flex-shrink-0 gap-1"
                onClick={onAddSolutionClick}
              >
                {getAddButtonText()}
                <ArrowRight size={14} />
              </Button>
            ) : (
              <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
            )}
          </div>
        </div>
      </div>

      <BountyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        title={relatedWork?.title ?? bountyLabel}
        content={bounty.comment?.content}
        contentFormat={bounty.comment?.contentFormat}
        bountyType={bounty.bountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadlineLabel={deadlineLabel}
        onAddSolutionClick={onAddSolutionClick}
        buttonText={getAddButtonText()}
        isActive={isActive}
      />
    </>
  );
};
