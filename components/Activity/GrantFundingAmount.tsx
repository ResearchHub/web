'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { AmountBadge } from './AmountBadge';
import type { FeedGrantAmount } from './lib/feedEntryAdapters';

interface GrantFundingAmountProps {
  amount: FeedGrantAmount;
  className?: string;
}

export const GrantFundingAmount: FC<GrantFundingAmountProps> = ({ amount, className }) => {
  const { showUSD } = useCurrencyPreference();
  const formatted = formatCurrency({
    amount: showUSD ? amount.usd : amount.rsc,
    showUSD,
    exchangeRate: 1,
    skipConversion: true,
    shorten: true,
  });

  return <AmountBadge className={className}>{formatted}</AmountBadge>;
};
