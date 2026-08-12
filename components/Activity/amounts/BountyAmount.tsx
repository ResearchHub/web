'use client';

import { FC } from 'react';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { getBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';
import { AmountBadge } from './AmountBadge';
import type { Bounty } from '@/types/bounty';

interface BountyAmountProps {
  bounty: Bounty;
  className?: string;
}

export const BountyAmount: FC<BountyAmountProps> = ({ bounty, className }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { amount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  return (
    <AmountBadge className={className}>
      {formatCurrency({
        amount: Math.round(amount),
        showUSD,
        exchangeRate,
        skipConversion: true,
        shorten: true,
      })}
    </AmountBadge>
  );
};
