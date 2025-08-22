'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Icon } from '@/components/ui/icons/Icon';
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
          <div className="flex flex-col gap-4 mobile:!flex-row mobile:!items-center mobile:!justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100/70 p-2.5 rounded-lg flex items-center justify-center">
                <Icon name="solidEarn" size={24} color="#FB923C" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-orange-800 flex items-center gap-1">
                  <CurrencyBadge
                    amount={calculateOpenBountiesAmount(metadata.bounties)}
                    variant="text"
                    size="sm"
                    currency={showUSD ? 'USD' : 'RSC'}
                    showExchangeRate={false}
                    showText={true}
                    textColor="text-orange-800"
                    className="font-medium gap-0.5 p-0 text-sm"
                  />
                  <span>Earning Opportunity</span>
                </h2>
                <p className="mt-1 text-sm text-orange-600">
                  Earn ResearchCoin by completing {metadata.openBounties}{' '}
                  {metadata.openBounties === 1 ? 'bounty' : 'bounties'} on this paper
                </p>
              </div>
            </div>
            <button
              onClick={handleViewBounties}
              className="px-4 py-2 bg-orange-400 text-white rounded-lg text-sm font-medium hover:bg-orange-500 transition-colors duration-200 shadow-sm hover:shadow-md flex items-center gap-2 group focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
              aria-label={`View ${metadata.openBounties} available ${metadata.openBounties === 1 ? 'bounty' : 'bounties'}`}
            >
              View Bounties
              <span
                className="inline-block transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
