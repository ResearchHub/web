'use client';

import { useMemo } from 'react';
import { Star } from 'lucide-react';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useEarningOverview } from '@/components/Earn/lib/hooks/useEarningOverview';
import type { EarningAmount } from '@/types/user';
import { formatRSC, formatLiteralUsd } from '@/utils/number';

interface DisplayPair {
  primary: string;
  secondary: string | null;
}

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

function formatAmountPair(
  amountRsc: number,
  totalUsd: number,
  showUSD: boolean,
  withPlus = false
): DisplayPair {
  const sign = withPlus && amountRsc > 0 ? '+' : '';
  const rsc = `${sign}${formatRSC({ amount: amountRsc, decimalPlaces: 2 })} RSC`;
  const usd = `${sign}${formatLiteralUsd(totalUsd)}`;
  return showUSD ? { primary: usd, secondary: rsc } : { primary: rsc, secondary: usd };
}

function formatEarningPair(amount: EarningAmount, showUSD: boolean, withPlus = false): DisplayPair {
  return formatAmountPair(amount.rsc, amount.rscUsdSnapshot + amount.usd, showUSD, withPlus);
}

export function EarnEarningsSummary() {
  const { user } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { overview, isLoading: isLoadingOverview } = useEarningOverview(user?.id);

  const reviewAmount = useMemo(
    () => sumEarningAmounts([overview?.bySource.TIP_REVIEW, overview?.bySource.BOUNTY_PAYOUT]),
    [overview]
  );
  const fundraiseAmount = useMemo(
    () =>
      sumEarningAmounts([
        overview?.bySource.FUNDRAISE_PAYOUT,
        overview?.bySource.USD_FUNDRAISE_PAYOUT,
      ]),
    [overview]
  );
  const totalRsc = overview?.totalEarned.rsc ?? 0;
  const totalUsd = (overview?.totalEarned.rscUsdSnapshot ?? 0) + (overview?.totalEarned.usd ?? 0);

  const total = useMemo(
    () => formatAmountPair(totalRsc, totalUsd, showUSD, true),
    [totalRsc, totalUsd, showUSD]
  );
  const reviews = useMemo(() => formatEarningPair(reviewAmount, showUSD), [reviewAmount, showUSD]);
  const fundraises = useMemo(
    () => formatEarningPair(fundraiseAmount, showUSD),
    [fundraiseAmount, showUSD]
  );

  const isReady = !isLoadingOverview;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header — Lifetime Earnings headline (the only green figure) */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Lifetime Earnings
        </div>
        {isReady ? (
          <div className="mt-1 flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl font-bold leading-none text-emerald-600">
              {total.primary}
            </span>
            {total.secondary && <span className="text-sm text-gray-500">{total.secondary}</span>}
          </div>
        ) : (
          <div className="mt-2 h-8 w-40 bg-gray-100 animate-pulse rounded" />
        )}
      </div>

      {/* Earnings by source */}
      <ul>
        <EarnSourceRow
          icon={
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
              <Star className="h-[18px] w-[18px] text-gray-900" />
            </span>
          }
          name="Peer Reviews"
          pair={reviews}
          loading={!isReady}
        />
        <EarnSourceRow
          icon={
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
              <FundingIcon size={18} color="#111827" />
            </span>
          }
          name="Funded proposals"
          pair={fundraises}
          loading={!isReady}
          isLast
        />
      </ul>
    </div>
  );
}

interface EarnSourceRowProps {
  icon: React.ReactNode;
  name: string;
  pair: DisplayPair;
  loading?: boolean;
  isLast?: boolean;
}

function EarnSourceRow({ icon, name, pair, loading, isLast }: EarnSourceRowProps) {
  return (
    <li
      className={cn(
        'px-4 sm:px-6 py-4 flex items-center justify-between gap-3',
        !isLast && 'border-b border-gray-100'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0">{icon}</span>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">
            {name}
          </span>
        </div>
      </div>
      <div className="text-right shrink-0">
        {loading ? (
          <div className="inline-block">
            <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />
            <div className="h-3 w-12 bg-gray-100 animate-pulse rounded mt-1" />
          </div>
        ) : (
          <>
            <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
              {pair.primary}
            </div>
            {pair.secondary && (
              <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{pair.secondary}</div>
            )}
          </>
        )}
      </div>
    </li>
  );
}
