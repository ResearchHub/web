'use client';

import { FC, useCallback, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useEarningOverview } from '@/components/Earn/lib/hooks/useEarningOverview';
import type { EarningAmount } from '@/types/user';
import { formatCurrency } from '@/utils/currency';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { FundingTotalsCard, type TotalsStat } from './FundingTotalsCard';

function sumEarningAmounts(amounts: (EarningAmount | undefined)[]): EarningAmount {
  return amounts.reduce<EarningAmount>(
    (acc, amount) => ({
      rsc: acc.rsc + (amount?.rsc ?? 0),
      rscUsdSnapshot: acc.rscUsdSnapshot + (amount?.rscUsdSnapshot ?? 0),
      usd: acc.usd + (amount?.usd ?? 0),
    }),
    { rsc: 0, rscUsdSnapshot: 0, usd: 0 }
  );
}

/** The amount in the preferred currency, shortened like the funder's totals ("$1.2K"). */
function amountStat(
  label: string,
  amountRsc: number,
  totalUsd: number,
  showUSD: boolean,
  exchangeRate: number
): TotalsStat {
  return {
    label,
    value: formatCurrency({
      amount: showUSD ? totalUsd : amountRsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    }),
  };
}

/** What a researcher has earned here: from reviews and from funded proposals. */
export const EarningsTotals: FC<{ className?: string }> = ({ className }) => {
  const { user } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { overview, isLoading } = useEarningOverview(user?.id);
  const earningStat = useCallback(
    (label: string, amount: EarningAmount) =>
      amountStat(label, amount.rsc, amount.rscUsdSnapshot + amount.usd, showUSD, exchangeRate),
    [showUSD, exchangeRate]
  );

  const reviews = useMemo(
    () =>
      earningStat(
        'Peer reviews',
        sumEarningAmounts([overview?.bySource.TIP_REVIEW, overview?.bySource.BOUNTY_PAYOUT])
      ),
    [overview, earningStat]
  );
  const fundraises = useMemo(
    () =>
      earningStat(
        'Funded proposals',
        sumEarningAmounts([
          overview?.bySource.FUNDRAISE_PAYOUT,
          overview?.bySource.USD_FUNDRAISE_PAYOUT,
        ])
      ),
    [overview, earningStat]
  );
  const total = useMemo(
    () =>
      amountStat(
        'Lifetime earnings',
        overview?.totalEarned.rsc ?? 0,
        (overview?.totalEarned.rscUsdSnapshot ?? 0) + (overview?.totalEarned.usd ?? 0),
        showUSD,
        exchangeRate
      ),
    [overview, showUSD, exchangeRate]
  );

  return (
    <FundingTotalsCard
      className={className}
      isLoading={isLoading}
      headline={{ ...total, tone: 'emerald' }}
      stats={[reviews, fundraises]}
    />
  );
};
