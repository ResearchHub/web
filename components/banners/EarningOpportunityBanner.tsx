'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { calculateOpenBountiesAmount } from '@/components/Bounty/lib/bountyUtil';
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
    <div
      className="bg-gradient-to-br bg-yellow-50 rounded-xl border border-orange-200/60 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
      role="banner"
      aria-label="Earning opportunity banner"
      onClick={handleViewBounties}
    >
      <div className="p-4">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-base font-semibold text-orange-600">Earn</span>
          <DollarSign className="w-4 h-4 text-orange-600 -mr-[6px]" strokeWidth={2.5} />
          <CurrencyBadge
            amount={calculateOpenBountiesAmount(metadata.bounties)}
            variant="text"
            size="sm"
            currency={showUSD ? 'USD' : 'RSC'}
            showExchangeRate={false}
            showText={true}
            showIcon={false}
            textColor="text-orange-600"
            className="font-semibold p-0 text-base inline-flex"
          />
        </div>
        <p className="mt-1.5 text-sm text-gray-600 leading-snug">
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
          <span
            className="inline-block transition-transform group-hover:translate-x-0.5 ml-1"
            aria-hidden="true"
          ></span>
        </Button>
      </div>
    </div>
  );
};
