'use client';

import { FC } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { PrimaryActionSection } from '@/components/Feed/BaseFeedItem';
import { Button } from '@/components/ui/Button';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { isDeadlineInFuture } from '@/utils/date';
import type { ActivityWorkContext } from '../lib/activityWorkContext';

interface ActivityGrantSlotProps {
  work: ActivityWorkContext;
}

export const ActivityGrantSlot: FC<ActivityGrantSlotProps> = ({ work }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const grant = work.grant;

  if (!grant) return null;

  const isActive =
    grant.status === 'OPEN' && (grant.endDate ? isDeadlineInFuture(grant.endDate) : true);
  const budgetAmount = showUSD ? grant.amount.usd : (grant.amount.rsc ?? 0);
  const hasBudget = grant.amount.usd > 0 || (grant.amount.rsc ?? 0) > 0;

  return (
    <PrimaryActionSection className="mt-0">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-6 min-w-0">
          {hasBudget && (
            <div className="flex flex-col leading-tight whitespace-nowrap">
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                Available Funding
              </span>
              <span className="font-mono font-semibold text-primary-600 text-xl">
                {formatCurrency({
                  amount: Math.round(budgetAmount),
                  showUSD,
                  exchangeRate,
                  skipConversion: showUSD,
                  shorten: true,
                })}
              </span>
            </div>
          )}

          <div className="flex flex-col leading-tight whitespace-nowrap">
            <span className="text-xs text-gray-500 uppercase tracking-wide">Proposals</span>
            <span className="text-xl font-semibold text-gray-900">{grant.numApplicants}</span>
          </div>

          {grant.organization && (
            <div className="hidden md:flex flex-col leading-tight min-w-0 max-w-[140px]">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Offered by</span>
              <span
                className="text-sm font-medium text-gray-700 truncate"
                title={grant.organization}
              >
                {grant.organization}
              </span>
            </div>
          )}
        </div>

        {isActive && (
          <Link href={work.href} className="flex-shrink-0">
            <Button variant="dark" size="sm" className="gap-1">
              Apply
              <ArrowRight size={14} />
            </Button>
          </Link>
        )}
      </div>
    </PrimaryActionSection>
  );
};
