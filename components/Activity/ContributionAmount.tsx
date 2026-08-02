'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrency } from '@/utils/currency';
import { AmountBadge } from './AmountBadge';
import { resolveDisplayedContribution, type FeedContribution } from './lib/feedEntryAdapters';

interface ContributionAmountProps {
  contribution: FeedContribution;
  className?: string;
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

  return <AmountBadge className={className}>{showSign ? `+${formatted}` : formatted}</AmountBadge>;
};
