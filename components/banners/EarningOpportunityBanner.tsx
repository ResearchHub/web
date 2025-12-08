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
import { DollarSign } from 'lucide-react';

interface EarningOpportunityBannerProps {
  work: Work;
  metadata: WorkMetadata;
  onViewBounties?: () => void;
}

export const EarningOpportunityBanner = ({
  work,
  metadata,
  onViewBounties,
}: EarningOpportunityBannerProps) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();
  const router = useRouter();

  // Don't show banner if no open bounties
  if (!metadata.bounties || metadata.openBounties === 0) {
    return null;
  }

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
        contentType: work.contentType === 'paper' ? 'paper' : 'post',
        slug: work.slug,
        tab: 'bounties',
      });
      router.push(bountiesUrl);
    }
  };

  return (
    <div
      className="bg-gradient-to-br bg-yellow-50 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      role="banner"
      aria-label="Earning opportunity banner"
      onClick={handleViewBounties}
    >
      <div className="p-3 tablet:p-4">
        {/* Mobile layout - compact single row */}
        <div className="flex tablet:hidden items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-semibold text-orange-600">Earn</span>
              {canDisplayAmount && (
                <>
                  <DollarSign className="w-3.5 h-3.5 text-orange-600 -mr-[5px]" strokeWidth={2.5} />
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
              <span className="text-sm text-orange-600">for peer review.</span>
            </div>
          </div>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewBounties();
            }}
            size="sm"
            className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm group-hover:shadow transition-all duration-200 text-xs px-3"
            aria-label={`View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`}
          >
            View
          </Button>
        </div>

        {/* Tablet+ layout - stacked with full-width button */}
        <div className="hidden tablet:block">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-base font-semibold text-orange-600">Earn</span>
            {canDisplayAmount && (
              <>
                <DollarSign className="w-4 h-4 text-orange-600 -mr-[6px]" strokeWidth={2.5} />
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
          <p className="mt-1.5 text-sm text-orange-600 leading-snug">
            Earn ResearchCoin by peer reviewing this paper.
          </p>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleViewBounties();
            }}
            size="sm"
            className="w-full mt-3 bg-orange-500 hover:bg-orange-600 text-white font-medium shadow-sm group-hover:shadow transition-all duration-200"
            aria-label={`View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`}
          >
            View Bounties
          </Button>
        </div>
      </div>
    </div>
  );
};
