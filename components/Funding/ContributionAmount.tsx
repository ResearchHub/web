'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { cn } from '@/utils/styles';
import type { FeedContribution } from './lib/feedEntryAdapters';

interface ContributionAmountProps {
  contribution: FeedContribution;
  className?: string;
}

// Sole place in the codebase that converts a contribution between its stored
// currency and the user's preferred currency. `formatCurrency` only knows how
// to convert RSC → USD via exchangeRate, so we do the symmetric math here and
// then hand it a pre-converted amount with skipConversion.
export const ContributionAmount: FC<ContributionAmountProps> = ({ contribution, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const sourceIsUSD = contribution.currency === 'USD';
  const canConvert = exchangeRate > 0;
  // Honor the user's preference when conversion is possible, otherwise fall
  // back to the stored currency so we never multiply by a 0 exchange rate.
  const displayInUSD = canConvert ? showUSD : sourceIsUSD;

  const displayAmount =
    sourceIsUSD === displayInUSD
      ? contribution.amount
      : sourceIsUSD
        ? contribution.amount / exchangeRate
        : contribution.amount * exchangeRate;

  const formatted = formatCurrency({
    amount: displayAmount,
    showUSD: displayInUSD,
    exchangeRate: 1,
    skipConversion: true,
    shorten: true,
  });

  return <span className={cn('text-xs font-medium font-mono', className)}>+{formatted}</span>;
};
