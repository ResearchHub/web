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
}

export const ContributionAmount: FC<ContributionAmountProps> = ({ contribution, className }) => {
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

  return <span className={cn('text-xs font-medium font-mono', className)}>+{formatted}</span>;
};
