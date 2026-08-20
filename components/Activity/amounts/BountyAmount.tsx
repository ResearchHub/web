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
  size?: 'sm' | 'md';
}

export const BountyAmount: FC<BountyAmountProps> = ({ bounty, className, size }) => {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { amount } = getBountyDisplayAmount(bounty, exchangeRate, showUSD);

  return (
    <AmountBadge
      className={className}
      size={size}
      variant={bounty.bountyType === 'REVIEW' ? 'orange' : 'green'}
    >
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
