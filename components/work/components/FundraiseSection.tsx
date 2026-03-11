'use client';

import { Fundraise } from '@/types/funding';
import { Users } from 'lucide-react';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { SidebarHeader } from '@/components/ui/SidebarHeader';

interface FundraiseSectionProps {
  fundraise: Fundraise;
}

export function FundraiseSection({ fundraise }: FundraiseSectionProps) {
  const { showUSD } = useCurrencyPreference();
  const percentage = Math.min(
    100,
    Math.round((fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100)
  );

  return (
    <section>
      <SidebarHeader title="Funding Progress" />
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-gray-900">{percentage}%</span>
          <div className="flex items-center gap-1 text-sm font-mono">
            <CurrencyBadge
              amount={showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc}
              variant="text"
              size="xs"
              currency={showUSD ? 'USD' : 'RSC'}
              showText={false}
              textColor="text-primary-600"
              fontWeight="font-semibold"
              skipConversion={showUSD}
              shorten
            />
            <span className="text-gray-500">/</span>
            <CurrencyBadge
              amount={showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc}
              variant="text"
              size="xs"
              currency={showUSD ? 'USD' : 'RSC'}
              showText={true}
              textColor="text-primary-600"
              fontWeight="font-semibold"
              skipConversion={showUSD}
              shorten
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">Contributors</span>
          </div>
          <span className="text-sm font-medium font-mono text-gray-900">
            {fundraise.contributors.numContributors}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-700">Status</span>
          <span className="text-sm font-medium text-gray-900">{fundraise.status}</span>
        </div>
      </div>
    </section>
  );
}
