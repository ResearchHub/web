'use client';

import { FC, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Info } from 'lucide-react';
import { PrimaryActionSection } from '@/components/Feed/BaseFeedItem';
import { Button } from '@/components/ui/Button';
import { BountyDetailsModal } from '@/components/Bounty/BountyInfo';
import { getBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';
import { buildWorkUrl } from '@/utils/url';
import { isDeadlineInFuture, getRemainingDays } from '@/utils/date';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { BountyType } from '@/types/bounty';
import { cn } from '@/utils/styles';
import { Tooltip } from '@/components/ui/Tooltip';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import type { ContentFormat } from '@/types/comment';
import type { CommentContent } from '@/components/Comment/lib/types';
import type { ActivityWorkContext } from '../lib/activityWorkContext';

interface ActivityBountySlotProps {
  work: ActivityWorkContext;
  bountyDetails?: {
    content: CommentContent;
    format: ContentFormat;
  };
}

export const ActivityBountySlot: FC<ActivityBountySlotProps> = ({ work, bountyDetails }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const bounty = work.bounty;
  if (!bounty) return null;

  const isActive =
    bounty.status === 'OPEN'
      ? bounty.expirationDate
        ? isDeadlineInFuture(bounty.expirationDate)
        : true
      : bounty.status === 'ASSESSMENT';

  const statusInfo = useMemo(() => {
    if (bounty.status === 'OPEN' && isActive) {
      const days = getRemainingDays(bounty.expirationDate ?? null);
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

  const displayAmount = getBountyDisplayAmount(bounty, exchangeRate, showUSD).amount;
  const bountyLabel = bounty.bountyType === 'REVIEW' ? 'Peer Review' : 'Bounty';
  const buttonText = bounty.bountyType === 'REVIEW' ? 'Add Review' : 'Solve';
  const targetTab = bounty.bountyType === 'REVIEW' ? 'reviews' : 'bounties';

  const handleDetailsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDetailsModalOpen(true);
  };

  const handleAddSolutionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = buildWorkUrl({
      id: work.id,
      slug: work.slug,
      contentType: work.documentType,
      tab: targetTab,
    });
    router.push(`${url}?focus=true`);
  };

  return (
    <>
      <PrimaryActionSection className="mt-0">
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
                    content="Editors are reviewing any submissions and will award top reviews."
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
              className="flex-shrink-0 rounded-lg text-[13px] gap-1.5 text-gray-600 hover:text-gray-800"
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
                onClick={handleAddSolutionClick}
              >
                {buttonText}
                <ArrowRight size={14} />
              </Button>
            ) : (
              <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
            )}
          </div>
        </div>
      </PrimaryActionSection>

      <BountyDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        content={bountyDetails?.content ?? null}
        contentFormat={bountyDetails?.format}
        bountyType={bounty.bountyType as BountyType}
        displayAmount={displayAmount}
        showUSD={showUSD}
        deadlineLabel={
          statusInfo.remaining ? `${statusInfo.label} (${statusInfo.remaining})` : statusInfo.label
        }
        onAddSolutionClick={handleAddSolutionClick}
        buttonText={buttonText}
        isActive={isActive}
      />
    </>
  );
};
