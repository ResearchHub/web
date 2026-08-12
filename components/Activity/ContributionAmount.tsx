'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatCurrencyAmount, type CurrencyAmount } from '@/utils/currency';
import { AmountBadge } from './AmountBadge';

interface ContributionAmountProps {
  contribution: CurrencyAmount;
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
  const formatted = formatCurrencyAmount({ ...contribution, showUSD, exchangeRate, shorten: true });

  return <AmountBadge className={className}>{showSign ? `+${formatted}` : formatted}</AmountBadge>;
};
