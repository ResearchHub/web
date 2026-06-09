'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { FundingLinksMenu } from '@/components/Funding/FundingLinksMenu';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { cn } from '@/utils/styles';

/** Placeholder shown in place of figures for signed-out users. */
const EMPTY = '—';

interface ResearchCoinSnapshotProps {
  className?: string;
  /**
   * When true the entire card becomes a button that opens the funding links
   * dropdown (My ResearchCoin / funder dashboard) and surfaces a hover
   * affordance. When false the card is a static read-out (e.g. in the profile
   * menu).
   */
  interactive?: boolean;
  /**
   * When set (and not `interactive`), the whole card becomes a link to this
   * destination with a hover affordance. Ignored when `interactive` is true.
   */
  href?: string;
  /** Click handler for the link variant (e.g. to close the containing menu). */
  onClick?: () => void;
}

/**
 * Compact read-out of the two pools of money a user can fund science with —
 * their spendable RSC balance and their funding credits. Shared between the
 * funding hero (interactive, opens a links menu) and the profile dropdown
 * (static). Pulls figures from the user + exchange rate so it respects the
 * USD/RSC preference toggle.
 */
export const ResearchCoinSnapshot: FC<ResearchCoinSnapshotProps> = ({
  className,
  interactive = false,
  href,
  onClick,
}) => {
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

  const balanceRsc = user?.balance ?? 0;
  const balanceUsd = exchangeRate ? balanceRsc * exchangeRate : 0;
  const creditsRsc = user?.lockedBalance ?? 0;
  const creditsUsd = exchangeRate ? creditsRsc * exchangeRate : 0;

  const balanceDisplay = user ? fmt(balanceRsc, balanceUsd) : EMPTY;
  const creditsDisplay = user ? fmt(creditsRsc, creditsUsd) : EMPTY;

  const cardBase =
    'flex h-12 w-full items-stretch divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white/80 shadow-sm';

  const stats = (
    <>
      <Stat
        label="RSC balance"
        value={balanceDisplay}
        valueClassName={user ? 'text-gray-900' : 'text-gray-300'}
      />
      <Stat
        label="Funding credits"
        value={
          user ? (
            <span className="inline-flex items-center gap-1">
              <ResearchCoinIcon size={16} variant="green" outlined />
              {creditsDisplay}
            </span>
          ) : (
            creditsDisplay
          )
        }
        valueClassName={user ? 'text-green-600' : 'text-gray-300'}
      />
    </>
  );

  if (!interactive) {
    if (href) {
      return (
        <Link
          href={href}
          onClick={onClick}
          className={cn(
            'text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40',
            cardBase,
            className
          )}
        >
          {stats}
        </Link>
      );
    }
    return <div className={cn(cardBase, className)}>{stats}</div>;
  }

  return (
    <FundingLinksMenu
      matchTriggerWidth
      trigger={
        <button
          type="button"
          aria-label="Funding options"
          className={cn(
            'group/widget cursor-pointer text-left transition-colors hover:border-primary-300 hover:bg-primary-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300',
            cardBase,
            className
          )}
        >
          {stats}
          <span className="flex flex-shrink-0 items-center justify-center px-2 text-gray-400 transition-colors group-hover/widget:text-primary-600">
            <ChevronDown
              size={18}
              className="transition-transform group-data-[state=open]/widget:rotate-180"
            />
          </span>
        </button>
      }
    />
  );
};

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
}

const Stat: FC<StatProps> = ({ label, value, valueClassName }) => (
  <span className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 px-3">
    <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-gray-500">
      {label}
    </span>
    <span
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        valueClassName ?? 'text-gray-900'
      )}
    >
      {value}
    </span>
  </span>
);

export const ResearchCoinSnapshotSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'flex h-12 w-full items-stretch divide-x divide-gray-200 overflow-hidden rounded-lg border border-gray-200 bg-white/80 shadow-sm',
      className
    )}
  >
    {[0, 1].map((i) => (
      <div key={i} className="flex flex-1 flex-col justify-center gap-0.5 px-3">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
        <div className="h-[18px] w-12 animate-pulse rounded bg-gray-200" />
      </div>
    ))}
    <div className="flex w-9 flex-shrink-0 items-center justify-center">
      <div className="h-4 w-4 animate-pulse rounded bg-gray-200" />
    </div>
  </div>
);
