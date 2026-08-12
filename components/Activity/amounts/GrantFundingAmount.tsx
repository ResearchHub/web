'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatCurrency } from '@/utils/currency';
import { AmountBadge } from './AmountBadge';
import type { ActivityGrantAmount } from '../lib/activityDisplay.utils';

interface GrantFundingAmountProps {
  amount: ActivityGrantAmount;
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
