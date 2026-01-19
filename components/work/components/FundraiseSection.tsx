'use client';

import { Fundraise } from '@/types/funding';
import { BarChart3, Users } from 'lucide-react';
import { Icon } from '@/components/ui/icons/Icon';
import { formatRSC } from '@/utils/number';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';

interface FundraiseSectionProps {
  fundraise: Fundraise;
}

export function FundraiseSection({ fundraise }: FundraiseSectionProps) {
  const { showUSD } = useCurrencyPreference();
  const progress = (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100;

  return (
    <section>
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="rscIcon" size={26} className="text-gray-500" />
        <h2 className="text-base font-semibold text-gray-900">Funding Progress</h2>
      </div>
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <CurrencyBadge
              amount={fundraise.amountRaised.rsc}
              variant="text"
              size="xs"
              currency={showUSD ? 'USD' : 'RSC'}
              showText={true}
              className="text-gray-600"
            />
            <CurrencyBadge
              amount={fundraise.goalAmount.rsc}
              variant="text"
              size="xs"
              currency={showUSD ? 'USD' : 'RSC'}
              showText={true}
              className="text-gray-600"
            />
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${
                fundraise.status === 'COMPLETED' ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{
                width: `${fundraise.status === 'COMPLETED' ? 100 : progress}%`,
              }}
            />
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">Status</span>
          </div>
          <span className="text-sm font-medium text-gray-900">{fundraise.status}</span>
        </div>
      </div>
    </section>
  );
}
