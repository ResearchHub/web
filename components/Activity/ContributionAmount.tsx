'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/styles';
import { resolveDisplayedContribution, type FeedContribution } from './lib/feedEntryAdapters';

interface ContributionAmountProps {
  contribution: FeedContribution;
  className?: string;
  /** Prefix with "+" (default). Set false for earnings like "earned $150". */
  showSign?: boolean;
}

export const ContributionAmount: FC<ContributionAmountProps> = ({
  contribution,
  className,
  showSign = true,
}) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { amount, inUSD } = resolveDisplayedContribution(contribution, showUSD, exchangeRate);

  const formatted = formatCurrency({
    amount,
    showUSD: inUSD,
    exchangeRate: 1,
    skipConversion: true,
    shorten: true,
  });

  return (
    <span
      className={cn(
        'inline-flex items-center rounded bg-green-100 px-1.5 py-0.5 font-mono text-[13px] font-semibold leading-tight text-green-800',
        className
      )}
    >
      {showSign ? `+${formatted}` : formatted}
    </span>
  );
};
