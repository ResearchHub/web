'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Icon } from '@/components/ui/icons/Icon';
import { Button } from '@/components/ui/Button';
import { calculateOpenBountiesAmount } from '@/components/Bounty/lib/bountyUtil';
import { buildWorkUrl } from '@/utils/url';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';

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
  const router = useRouter();

  // Don't show banner if no open bounties
  if (!metadata.bounties || metadata.openBounties === 0) {
    return null;
  }

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
    <div className="mb-6">
      <div
        className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200 shadow-sm hover:shadow-md transition-shadow duration-200"
        role="banner"
        aria-label="Earning opportunity banner"
      >
        <div className="p-4">
          <div className="flex flex-col min-[650px]:!flex-row gap-4 min-[650px]:!items-center min-[650px]:!justify-between">
            <div className="flex items-start gap-3 min-[650px]:!flex-1">
              <div className="bg-orange-100/70 p-2.5 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name="solidEarn" size={24} color="#f68401" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-medium text-orange-700">
                  <span className="flex flex-wrap items-baseline gap-x-1">
                    <CurrencyBadge
                      amount={calculateOpenBountiesAmount(metadata.bounties)}
                      variant="text"
                      size="sm"
                      currency={showUSD ? 'USD' : 'RSC'}
                      showExchangeRate={false}
                      showText={true}
                      showIcon={showUSD}
                      textColor="text-orange-700"
                      className="font-medium p-0 text-sm inline-flex"
                    />
                    <span className="whitespace-nowrap">earning opportunity</span>
                  </span>
                </h2>
                <p className="mt-1 text-sm text-orange-600">
                  Earn ResearchCoin by completing{' '}
                  <span className="whitespace-nowrap">bounties on this paper.</span>
                </p>
              </div>
            </div>
            <Button
              onClick={handleViewBounties}
              size="default"
              className="bg-orange-400 hover:bg-orange-500 text-white focus-visible:ring-orange-400 whitespace-nowrap group w-full min-[650px]:!w-auto flex-shrink-0"
              aria-label={`View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`}
            >
              View Bounties
              <span
                className="inline-block transition-transform group-hover:translate-x-1 ml-1"
                aria-hidden="true"
              >
                →
              </span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
