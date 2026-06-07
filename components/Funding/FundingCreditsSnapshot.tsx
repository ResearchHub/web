'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { FundingCreditsTooltip } from '@/components/tooltips/FundingCreditsTooltip';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { useFundingOverview } from '@/hooks/useFundingOverview';
import { cn } from '@/utils/styles';

interface FundingCreditsSnapshotProps {
  className?: string;
}

export const FundingCreditsSnapshot: FC<FundingCreditsSnapshotProps> = ({ className }) => {
  const { user, isLoading: isLoadingUser } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isLoadingRate } = useExchangeRate();
  const { overview, isLoading: isLoadingOverview } = useFundingOverview();

  if (isLoadingUser || !user) return null;

  const isLoading = isLoadingOverview || isLoadingRate;
  if (isLoading) {
    return (
      <div
        className={cn(
          'h-[64px] rounded-xl border border-dashed border-gray-300 bg-gray-50 animate-pulse',
          className
        )}
      />
    );
  }

  const fmt = (rsc: number, usd: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const givenRsc = overview?.totalGiven.rsc ?? 0;
  const givenUsd = overview?.totalGiven.usd ?? 0;
  const hasGiven = givenRsc > 0 || givenUsd > 0;

  const creditsRsc = user.lockedBalance ?? 0;
  const creditsUsd = exchangeRate ? creditsRsc * exchangeRate : 0;
  const hasCredits = creditsRsc > 0;

  // Nothing worth showing — skip the band entirely for non-funders.
  if (!hasGiven && !hasCredits) return null;

  const creditsValue = fmt(creditsRsc, creditsUsd);

  return (
    <section
      aria-label="Your funding credits"
      className={cn(
        'relative overflow-hidden rounded-xl border border-dashed border-gray-300 bg-white',
        'bg-[radial-gradient(1000px_360px_at_-10%_-60%,rgba(34,197,94,.07),transparent_55%)]',
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-5 py-2.5 tablet:px-6">
        <div className="flex flex-shrink-0 items-center divide-x divide-gray-200">
          <Stat
            label="You've given"
            value={fmt(givenRsc, givenUsd)}
            valueClassName="text-primary-600"
          />
          <Stat
            label="Funding credits"
            value={
              <FundingCreditsTooltip>
                <span className="inline-flex cursor-help items-center gap-1.5">
                  <ResearchCoinIcon size={18} variant="green" outlined />
                  {creditsValue}
                </span>
              </FundingCreditsTooltip>
            }
            valueClassName="text-green-600"
          />
        </div>

        <p className="hidden min-w-0 flex-1 truncate text-sm text-gray-600 sm:block">
          {hasCredits ? (
            <>
              You have <span className="font-semibold text-green-600">{creditsValue}</span> in
              credits ready to deploy.
            </>
          ) : (
            <>Back a proposal or open your own funding opportunity.</>
          )}
        </p>

        <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
          <Link
            href="/fund/proposals"
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary-600 px-3.5 py-1.5 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            Fund proposals
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/fund/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-primary-600 transition-colors hover:border-primary-300 hover:bg-primary-50"
          >
            View dashboard
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
};

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
}

const Stat: FC<StatProps> = ({ label, value, valueClassName }) => (
  <div className="flex flex-col gap-0.5 px-4 first:pl-0 last:pr-0">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
      {label}
    </span>
    <span
      className={cn(
        'text-xl font-semibold leading-none tracking-tight',
        valueClassName ?? 'text-gray-900'
      )}
    >
      {value}
    </span>
  </div>
);
