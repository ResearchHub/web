'use client';

import { FC, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Star } from 'lucide-react';
import { PrimaryActionSection } from '@/components/Feed/BaseFeedItem';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Button } from '@/components/ui/Button';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { PeerReviewTooltip } from '@/components/tooltips/PeerReviewTooltip';
import { Tooltip } from '@/components/ui/Tooltip';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useShareModalContext } from '@/contexts/ShareContext';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';
import type { ActivityWorkContext } from '../lib/activityWorkContext';

interface ActivityFundraiseSlotProps {
  work: ActivityWorkContext;
  reviewScore?: number;
}

export const ActivityFundraiseSlot: FC<ActivityFundraiseSlotProps> = ({ work, reviewScore }) => {
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { showShareModal } = useShareModalContext();
  const [isContributeModalOpen, setIsContributeModalOpen] = useState(false);

  const fundraise = work.fundraise;
  if (!fundraise) return null;

  const isActive =
    fundraise.status === 'OPEN' &&
    (fundraise.endDate ? isDeadlineInFuture(fundraise.endDate) : true);

  const hasReviewScore = reviewScore !== undefined && reviewScore > 0;

  const contributors = useMemo(
    () =>
      fundraise.contributors?.topContributors?.map((c) => ({
        src: c.authorProfile.profileImage || '',
        alt: c.authorProfile.fullName,
        tooltip: c.authorProfile.fullName,
        authorId: c.authorProfile.id || undefined,
      })) ?? [],
    [fundraise.contributors?.topContributors]
  );

  const handleFundClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsContributeModalOpen(true);
  };

  const handleContributeSuccess = () => {
    setIsContributeModalOpen(false);
    showShareModal({
      url: window.location.href,
      docTitle: work.title,
      action: 'USER_FUNDED_PROPOSAL',
    });
    router.refresh();
  };

  return (
    <>
      <PrimaryActionSection className="mt-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-6 min-w-0">
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Requested</span>
              <span className="font-mono font-semibold text-primary-600 text-xl">
                {formatCurrency({
                  amount:
                    fundraise.status === 'COMPLETED'
                      ? Math.round(showUSD ? fundraise.goalAmount.usd : fundraise.amountRaised.rsc)
                      : Math.round(showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc),
                  showUSD,
                  exchangeRate,
                  skipConversion: true,
                  shorten: true,
                })}
              </span>
            </div>

            {contributors.length > 0 && (
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Backers</span>
                <AvatarStack
                  items={contributors}
                  size="xs"
                  maxItems={3}
                  spacing={-6}
                  showLabel={false}
                  disableTooltip={false}
                  showExtraCount={true}
                  totalItemsCount={fundraise.contributors.numContributors}
                  extraCountLabel="Backers"
                />
              </div>
            )}

            {hasReviewScore && (
              <div className="hidden sm:flex flex-col leading-tight whitespace-nowrap">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Peer Review</span>
                <Tooltip
                  content={
                    <PeerReviewTooltip reviews={[]} averageScore={reviewScore!} href={work.href} />
                  }
                  position="top"
                  width="w-[320px]"
                >
                  <span className="inline-flex items-center gap-1 text-xl font-semibold text-gray-900 cursor-help">
                    <Star size={18} className="fill-amber-400 text-amber-400" />
                    {reviewScore!.toFixed(1)}
                  </span>
                </Tooltip>
              </div>
            )}
          </div>

          {isActive ? (
            <Button
              variant="dark"
              size="sm"
              className="flex-shrink-0 gap-1"
              onClick={handleFundClick}
            >
              Fund
              <ArrowRight size={14} />
            </Button>
          ) : (
            <span className="flex-shrink-0 text-sm text-gray-400">Ended</span>
          )}
        </div>
      </PrimaryActionSection>

      <ContributeToFundraiseModal
        isOpen={isContributeModalOpen}
        onClose={() => setIsContributeModalOpen(false)}
        onContributeSuccess={handleContributeSuccess}
        fundraise={fundraise}
        proposalTitle={work.title}
      />
    </>
  );
};
