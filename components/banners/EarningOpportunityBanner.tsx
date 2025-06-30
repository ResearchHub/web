'use client';

import { Coins } from 'lucide-react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
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
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
        <div className="p-4">
          <div className="flex flex-col gap-4 mobile:!flex-row mobile:!items-center mobile:!justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Coins className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-orange-900 flex items-center gap-1">
                  <CurrencyBadge
                    amount={calculateOpenBountiesAmount(metadata.bounties)}
                    variant="text"
                    size="sm"
                    currency={showUSD ? 'USD' : 'RSC'}
                    showExchangeRate={false}
                    showText={true}
                    textColor="text-orange-900"
                    className="font-medium gap-0.5 p-0 text-sm"
                  />
                  <span>Earning Opportunity</span>
                </h2>
                <p className="mt-1 text-sm text-orange-700">
                  Earn ResearchCoin by completing bounties on this paper
                </p>
              </div>
            </div>
            <button
              onClick={handleViewBounties}
              className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600"
            >
              View Bounties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
