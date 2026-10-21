'use client';

import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { formatRSC } from '@/utils/number';
import { cn } from '@/utils/styles';
import { YOU_CARD } from './youStyles';

const HIDDEN = '••••';

/**
 * Funding power on the You panel: the total, a bar split between funding
 * credits and RSC, both amounts, and Add funds. Tapping the total hides the
 * amounts, the same switch as every other funding power surface.
 */
export function YouFundingPowerCard() {
  const { isReady, total, rscBalance, fundingCredits } = useFundingPower();
  const { isAmountHidden, toggleAmountHidden, isPrivacyReady, openAddFunds } =
    useFundingPowerControls();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  if (!isReady) return <YouFundingPowerSkeleton />;

  const inUsd = showUSD && exchangeRate > 0;
  // Whole dollars or whole RSC, unshortened: this card is where the exact figure lives.
  const amount = (rsc: number) =>
    inUsd
      ? `$${Math.round(rsc * exchangeRate).toLocaleString()}`
      : formatRSC({ amount: rsc, round: true });
  const mask = (text: string) => (isAmountHidden ? HIDDEN : text);

  const creditsShare = total > 0 ? Math.min(1, Math.max(0, fundingCredits / total)) : 0;
  const hasCredits = fundingCredits > 0;
  const hasRsc = rscBalance > 0;

  return (
    <section aria-label="Funding power" className={cn(YOU_CARD, 'p-3.5')}>
      <h2 className="text-[13.5px] font-semibold text-gray-900">Funding power</h2>

      <button
        type="button"
        onClick={toggleAmountHidden}
        aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
        className={cn(
          'mt-1.5 block rounded font-geist-mono text-[28px] font-semibold leading-[34px] tracking-[-0.02em] text-gray-900 outline-none focus-visible:ring-2 focus-visible:ring-primary-500',
          !isPrivacyReady && 'invisible'
        )}
      >
        {mask(inUsd ? amount(total) : `${amount(total)} RSC`)}
      </button>

      <div aria-hidden="true" className="mt-2 flex h-1.5 gap-[3px]">
        {!hasCredits && !hasRsc ? (
          <span className="flex-1 rounded-full bg-gray-200" />
        ) : (
          <>
            {hasCredits && (
              <span
                className={cn('rounded-full bg-emerald-500', !hasRsc && 'flex-1')}
                style={hasRsc ? { width: `${creditsShare * 100}%` } : undefined}
              />
            )}
            {hasRsc && <span className="min-w-[6px] flex-1 rounded-full bg-amber-500" />}
          </>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-3 text-[12.5px] text-gray-600">
        <span className="min-w-0">
          <span className="font-geist-mono font-semibold text-emerald-700">
            {mask(amount(fundingCredits))}
          </span>{' '}
          credits ·{' '}
          <span className="font-geist-mono font-semibold text-gray-900">
            {mask(amount(rscBalance))}
          </span>{' '}
          RSC
        </span>
        <button
          type="button"
          onClick={openAddFunds}
          className="shrink-0 rounded text-[13px] font-semibold text-gray-900 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-primary-500"
        >
          Add funds
        </button>
      </div>
    </section>
  );
}

function YouFundingPowerSkeleton() {
  return (
    <div aria-hidden="true" className={cn(YOU_CARD, 'animate-pulse p-3.5')}>
      <div className="h-4 w-24 rounded bg-gray-100" />
      <div className="mt-2.5 h-7 w-32 rounded bg-gray-100" />
      <div className="mt-3 h-1.5 rounded-full bg-gray-100" />
      <div className="mt-3 h-3.5 w-44 rounded bg-gray-100" />
    </div>
  );
}
