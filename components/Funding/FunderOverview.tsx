'use client';

import { FC, useEffect, useState } from 'react';
import { cn } from '@/utils/styles';
import { Avatar } from '@/components/ui/Avatar';
import { FunderService } from '@/services/funder.service';
import { FunderOverview as FunderOverviewType } from '@/types/funder';
import { FundingChart } from '@/components/Funding/FundingChart';
import { useImpactData } from '@/app/funding/dashboard/lib/useImpactData';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

interface FunderOverviewProps {
  className?: string;
  userId?: number;
}

export const FunderOverview: FC<FunderOverviewProps> = ({ className, userId }) => {
  const [overview, setOverview] = useState<FunderOverviewType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { data: impactData } = useImpactData(userId);

  useEffect(() => {
    let cancelled = false;

    FunderService.getFundingOverview(userId)
      .then((data) => {
        if (!cancelled) setOverview(data);
      })
      .catch(() => {
        if (!cancelled) setOverview(null);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading) {
    return (
      <div className={cn('rounded-xl border border-gray-200 p-6 animate-pulse', className)}>
        <div className="h-5 w-32 bg-gray-200 rounded mb-4" />
        <div className="grid grid-cols-2 gap-6">
          <div className="h-12 bg-gray-100 rounded" />
          <div className="h-12 bg-gray-100 rounded" />
        </div>
      </div>
    );
  }

  if (!overview) return null;

  return (
    <div className={cn('rounded-xl border border-gray-200 p-6', className)}>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Funding Overview</h2>
      <div className="grid grid-cols-2 gap-8">
        {/* Left column */}
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Supported Researchers
            </span>
            {overview.supportedResearchers.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {overview.supportedResearchers.map((r) => (
                  <Avatar
                    key={r.id}
                    src={r.authorProfile.profileImage}
                    alt={r.authorProfile.fullName}
                    size="sm"
                    authorId={r.authorProfile.id}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mt-2">None yet</p>
            )}
          </div>
          <Stat
            label="Distributed Funds"
            rsc={overview.distributedFunds.rsc}
            showUSD={showUSD}
            exchangeRate={exchangeRate}
          />
          <Stat
            label="Matched Funds"
            rsc={overview.matchedFunds.rsc}
            showUSD={showUSD}
            exchangeRate={exchangeRate}
          />
        </div>

        {/* Right column */}
        <div className="min-w-0">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Funding Over Time
          </span>
          {impactData && impactData.fundingOverTime.length > 0 ? (
            <div className="mt-2">
              <FundingChart data={impactData.fundingOverTime} />
            </div>
          ) : (
            <p className="text-sm text-gray-400 mt-2">No data yet</p>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatProps {
  label: string;
  rsc: number;
  showUSD: boolean;
  exchangeRate: number;
}

function Stat({ label, rsc, showUSD, exchangeRate }: StatProps) {
  const display = formatCurrency({ amount: rsc, showUSD, exchangeRate });
  const suffix = showUSD ? '' : ' RSC';

  return (
    <div>
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <p className="text-xl font-semibold text-gray-900 mt-1">
        {display}
        {suffix && <span className="text-sm font-normal text-gray-500">{suffix}</span>}
      </p>
    </div>
  );
}
