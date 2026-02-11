'use client';

import { useMemo } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { getOpenBounties, getTotalBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { buildWorkUrl } from '@/utils/url';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { DollarSign, Trophy } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Bounty } from '@/types/bounty';

interface EarningOpportunityBannerProps {
  work: Work;
  metadata: WorkMetadata;
  onViewBounties?: () => void;
  onAwardBounty?: (bountyId: number) => void;
}

export const EarningOpportunityBanner = ({
  work,
  metadata,
  onViewBounties,
  onAwardBounty,
}: EarningOpportunityBannerProps) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const router = useRouter();
  const { user } = useUser();

  // Don't show banner if no open bounties
  if (!metadata.bounties || metadata.openBounties === 0) {
    return null;
  }

  // Check if current user is the creator of any open bounty
  const userBounties = useMemo(() => {
    if (!user?.id || !metadata.bounties) return [];
    return metadata.bounties.filter(
      (b: Bounty) => b.createdBy.id === user.id && (b.status === 'OPEN' || b.status === 'ASSESSMENT')
    );
  }, [user?.id, metadata.bounties]);

  const isBountyCreator = userBounties.length > 0;

  // Calculate display amount (handles Foundation bounties with flat $150 USD)
  const openBounties = useMemo(() => getOpenBounties(metadata.bounties || []), [metadata.bounties]);
  const { amount: displayAmount } = useMemo(
    () => getTotalBountyDisplayAmount(openBounties, exchangeRate, showUSD),
    [openBounties, exchangeRate, showUSD]
  );

  // Check if we can display the bounty amount (exchange rate loaded if USD preferred)
  const canDisplayAmount = !showUSD || (showUSD && !isExchangeRateLoading && exchangeRate > 0);

  const handleViewBounties = () => {
    if (onViewBounties) {
      onViewBounties();
    } else {
      const bountiesUrl = buildWorkUrl({
        id: work.id,
        contentType: work.contentType,
        slug: work.slug,
        tab: 'bounties',
      });
      router.push(bountiesUrl);
    }
  };

  const handleAwardBounty = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAwardBounty && userBounties.length > 0) {
      onAwardBounty(userBounties[0].id);
    } else {
      handleViewBounties();
    }
  };

  return (
    <div
      className="bg-gradient-to-br bg-yellow-50 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      role="banner"
      aria-label="Earning opportunity banner"
      onClick={isBountyCreator ? handleAwardBounty : handleViewBounties}
    >
      <div className="p-3 tablet:!p-4">
        {/* Mobile layout - compact single row */}
        <div className="flex tablet:!hidden items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-sm font-semibold text-orange-600">
                {isBountyCreator ? 'Your Bounty' : 'Earn'}
              </span>
              {canDisplayAmount && (
                <>
                  {showUSD && (
                    <DollarSign
                      className="w-3.5 h-3.5 text-orange-600 -mr-[5px]"
                      strokeWidth={2.5}
                    />
                  )}
                  <CurrencyBadge
                    amount={displayAmount}
                    variant="text"
                    size="sm"
                    currency={showUSD ? 'USD' : 'RSC'}
                    showExchangeRate={false}
                    showText={true}
                    showIcon={false}
                    textColor="text-orange-600"
                    fontWeight="font-semibold"
                    className="p-0 text-sm inline-flex"
                    skipConversion={showUSD}
                  />
                </>
              )}
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              isBountyCreator ? handleAwardBounty(e) : handleViewBounties();
            }}
            size="sm"
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm group-hover:shadow transition-all duration-200 text-xs px-3"
            aria-label={
              isBountyCreator
                ? 'Award Bounty'
                : `View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`
            }
          >
            {isBountyCreator ? 'Award' : 'View'}
          </Button>
        </div>

        {/* Tablet+ layout - stacked with full-width button */}
        <div className="hidden tablet:!block">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-base font-semibold text-orange-600">
                {isBountyCreator ? 'Your Active Bounty' : 'Earn'}
              </span>
              {canDisplayAmount && (
                <>
                  {showUSD && (
                    <DollarSign className="w-4 h-4 text-orange-600 -mr-[6px]" strokeWidth={2.5} />
                  )}
                  <CurrencyBadge
                    amount={displayAmount}
                    variant="text"
                    size="sm"
                    currency={showUSD ? 'USD' : 'RSC'}
                    showExchangeRate={false}
                    showText={true}
                    showIcon={false}
                    textColor="text-orange-600"
                    fontWeight="font-semibold"
                    className="p-0 text-base inline-flex"
                    skipConversion={showUSD}
                  />
                </>
              )}
            </div>
            {isBountyCreator && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap bg-orange-100 text-orange-700">
                {userBounties.length > 1 ? `${userBounties.length} Bounties` : '1 Bounty'}
              </span>
            )}
          </div>
          <p className="mt-1.5 text-sm text-orange-600/80 leading-snug">
            {isBountyCreator
              ? 'Review submissions and award your bounty.'
              : 'Submit a peer review to earn ResearchCoin.'}
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              isBountyCreator ? handleAwardBounty(e) : handleViewBounties();
            }}
            size="sm"
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm group-hover:shadow transition-all duration-200 gap-2"
            aria-label={
              isBountyCreator
                ? 'Award Bounty'
                : `View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`
            }
          >
            {isBountyCreator ? (
              <>
                <Trophy size={16} />
                <span>Award Bounty</span>
              </>
            ) : (
              'View Bounties'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
