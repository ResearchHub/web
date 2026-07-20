'use client';

import { FC } from 'react';
import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';
import { DEMO_SPENDING_POWER } from '@/mocks/demo-fixtures/spending-power';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

const EMPTY = '—';

const Row: FC<{ label: string; tooltip?: string; value: string; valueClassName?: string }> = ({
  label,
  tooltip,
  value,
  valueClassName,
}) => (
  <div className="flex items-center justify-between text-xs text-gray-600">
    <span className="flex items-center gap-1">
      {label}
      {tooltip && (
        <span title={tooltip} className="cursor-help text-gray-400 hover:text-gray-500">
          <HelpCircle size={11} />
        </span>
      )}
    </span>
    <span className={cn('font-semibold', valueClassName)}>{value}</span>
  </div>
);

export const SpendingPowerCard: FC = () => {
  const { user } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const fmt = (rsc: number, usd: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  let balanceDisplay: string;
  let creditsDisplay: string;
  let totalDisplay: string;
  let isLoggedIn: boolean;

  if (DEMO_MODE) {
    const { balanceRsc, balanceUsd, creditsRsc, creditsUsd, totalUsd } = DEMO_SPENDING_POWER;
    const totalRsc = balanceRsc + creditsRsc;
    balanceDisplay = fmt(balanceRsc, balanceUsd);
    creditsDisplay = fmt(creditsRsc, creditsUsd);
    totalDisplay = fmt(totalRsc, totalUsd);
    isLoggedIn = true;
  } else {
    isLoggedIn = !!user;
    const balanceRsc = user?.balance ?? 0;
    const balanceUsd = exchangeRate ? balanceRsc * exchangeRate : 0;
    const creditsRsc = user?.lockedBalance ?? 0;
    const creditsUsd = exchangeRate ? creditsRsc * exchangeRate : 0;
    const totalRsc = balanceRsc + creditsRsc;
    const totalUsd = balanceUsd + creditsUsd;

    balanceDisplay = user ? fmt(balanceRsc, balanceUsd) : EMPTY;
    creditsDisplay = user ? fmt(creditsRsc, creditsUsd) : EMPTY;
    totalDisplay = user ? fmt(totalRsc, totalUsd) : EMPTY;
  }

  return (
    <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-4 space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-primary-600">
        Your Spending Power
      </p>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-900 tracking-tight">{totalDisplay}</span>
        {isLoggedIn && <span className="text-xs text-gray-500">available to fund science</span>}
      </div>

      <div className="space-y-1.5">
        <Row
          label="Funding credits"
          tooltip="You accrue funding credits just by holding RSC — spend them to fund science."
          value={isLoggedIn ? `${creditsDisplay}` : EMPTY}
          valueClassName="text-[#19a74e]"
        />
        <Row label="RSC balance" value={balanceDisplay} />
        <Row
          label="Current yield"
          value={`${DEMO_SPENDING_POWER.apyPercent}% APY`}
          valueClassName="text-[#19a74e]"
        />
      </div>

      {isLoggedIn ? (
        <div className="flex gap-2 pt-1">
          <Link
            href="/fund"
            className="flex-1 text-center text-xs font-medium py-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
          >
            Fund now
          </Link>
          <Link
            href="/researchcoin"
            className="flex-1 text-center text-xs font-medium py-1.5 rounded-md border border-primary-300 text-primary-600 bg-white hover:bg-primary-50 transition-colors"
          >
            Deposit
          </Link>
        </div>
      ) : (
        <Link
          href="/login"
          className="block text-center text-xs font-medium py-1.5 rounded-md bg-primary-500 text-white hover:bg-primary-600 transition-colors"
        >
          Sign in to fund science
        </Link>
      )}

      {!isLoggedIn && !DEMO_MODE && (
        <p className="text-[10px] text-gray-400 text-center">Sign in to see your balance</p>
      )}
    </div>
  );
};

export const SpendingPowerCardSkeleton: FC = () => (
  <div className="rounded-lg border border-primary-200 bg-primary-50/40 p-4 space-y-3 animate-pulse">
    <div className="h-3 w-32 rounded bg-primary-200" />
    <div className="h-7 w-24 rounded bg-primary-200" />
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex justify-between">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-3 w-12 rounded bg-gray-200" />
        </div>
      ))}
    </div>
    <div className="flex gap-2 pt-1">
      <div className="flex-1 h-8 rounded-md bg-primary-200" />
      <div className="flex-1 h-8 rounded-md bg-gray-200" />
    </div>
  </div>
);
