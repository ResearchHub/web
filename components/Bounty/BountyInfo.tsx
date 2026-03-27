'use client';

import { FC, useMemo, useState } from 'react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { BaseModal } from '@/components/ui/BaseModal';
import { isDeadlineInFuture, getRemainingDays } from '@/utils/date';
import { isExpiringSoon } from './lib/bountyUtil';
import { Bounty, BountyType } from '@/types/bounty';
import { Work } from '@/types/work';
import { colors } from '@/app/styles/colors';
import { cn } from '@/utils/styles';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { ContentFormat } from '@/types/comment';
import { BountyDetails } from '@/components/Feed/items/FeedItemBountyComment';
import { Forward, ArrowRight, Info, Clock } from 'lucide-react';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { Tooltip } from '@/components/ui/Tooltip';
import { getBountyDisplayAmount } from './lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';

export interface BountyDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
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

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Details"
      maxWidth="max-w-xl"
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

  const statusInfo = useMemo(() => {
    if (bounty.status === 'OPEN' && isActive) {
      const days = 0.5; //getRemainingDays(bounty.expirationDate ?? null);
      const remaining =
        days !== null
          ? days < 1
            ? '< 1 day remaining'
            : `${Math.floor(days)} day${Math.floor(days) === 1 ? '' : 's'} remaining`
          : null;
      return { label: 'Open', color: 'bg-green-500', remaining, urgent: days !== null && days < 3 };
    }
    if (bounty.status === 'ASSESSMENT') {
      return { label: 'Assessment', color: 'bg-orange-500', remaining: null, urgent: false };
    }
    return { label: 'Completed', color: 'bg-gray-400', remaining: null, urgent: false };
  }, [bounty.status, bounty.expirationDate, isActive]);

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

            <div className="hidden sm:flex flex-col leading-tight">
              <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Status</span>
              <div className="flex items-center gap-1.5">
                <RadiatingDot color={statusInfo.color} size="sm" isRadiating={isActive} />
                {bounty.status === 'ASSESSMENT' ? (
                  <Tooltip
                    content="Editors are reviewing submissions and will award top reviews."
                    position="top"
                  >
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap border-b border-dashed border-gray-400 cursor-help">
                      {statusInfo.label}
                    </span>
                  </Tooltip>
                ) : (
                  <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                    {statusInfo.label}
                  </span>
                )}
                {statusInfo.remaining && (
                  <span
                    className={cn(
                      'text-xs whitespace-nowrap',
                      statusInfo.urgent ? 'text-amber-600 font-medium' : 'text-gray-500'
                    )}
                  >
                    ({statusInfo.remaining})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outlined"
              size="sm"
              className="flex-shrink-0 rounded-md text-[13px] gap-1.5 text-gray-600 hover:text-gray-800"
              onClick={handleDetailsClick}
            >
              <Info size={14} />
              <span className="hidden sm:inline">Details</span>
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
        content={bounty.comment?.content}
        contentFormat={bounty.comment?.contentFormat}
        bountyType={bounty.bountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadlineLabel={
          statusInfo.remaining ? `${statusInfo.label} (${statusInfo.remaining})` : statusInfo.label
        }
        onAddSolutionClick={onAddSolutionClick}
        buttonText={getAddButtonText()}
        isActive={isActive}
      />
    </>
  );
};
