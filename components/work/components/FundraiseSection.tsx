'use client';

import { Fundraise } from '@/types/funding';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { SidebarHeader } from '@/components/ui/SidebarHeader';
import { getEffectiveStatus } from '@/components/Fund/lib/fundraiseUtils';
import { formatDate } from '@/utils/date';

interface FundraiseSectionProps {
  fundraise: Fundraise;
}

export function FundraiseSection({ fundraise }: FundraiseSectionProps) {
  const { showUSD } = useCurrencyPreference();
  const effectiveStatus = getEffectiveStatus(fundraise);
  const isCompleted = effectiveStatus === 'COMPLETED';
  const percentage = isCompleted
    ? 100
    : Math.min(100, Math.round((fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100));

  const raisedAmount = isCompleted
    ? Math.round(showUSD ? fundraise.goalAmount.usd : fundraise.amountRaised.rsc)
    : Math.round(showUSD ? fundraise.amountRaised.usd : fundraise.amountRaised.rsc);

  const goalAmount = isCompleted
    ? Math.round(showUSD ? fundraise.goalAmount.usd : fundraise.amountRaised.rsc)
    : Math.round(showUSD ? fundraise.goalAmount.usd : fundraise.goalAmount.rsc);

  return (
    <section>
      <SidebarHeader title="Funding Progress" />
      <div className="space-y-4">
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold font-mono text-gray-900">{percentage}%</span>
          <div className="flex items-center gap-1 text-sm font-mono">
            <CurrencyBadge
              amount={raisedAmount}
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
              amount={goalAmount}
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
          <span className="text-sm font-medium text-gray-900">{effectiveStatus}</span>
        </div>

        {fundraise.endDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">End date</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(fundraise.endDate)}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
