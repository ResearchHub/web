'use client';

import { FC, ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatCurrency } from '@/utils/currency';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { useFundingOverview } from '@/hooks/useFundingOverview';
import { cn } from '@/utils/styles';

/** Placeholder shown in place of figures for signed-out users. */
const EMPTY = '—';

interface FundingHeroPanelProps {
  /**
   * The page's primary action rendered beneath the snapshot (e.g. the
   * "open a funding opportunity" or "submit proposal" CTA). Passed in so the
   * same snapshot pattern can be shared across the Fund and Proposals pages.
   */
  primaryCta: ReactNode;
}

/**
 * Hero right-rail panel for the Fund/Proposals pages. Surfaces the user's
 * funding snapshot (amount given + available credits) above the page's primary
 * CTA. The card always renders so the hero keeps a consistent height: for
 * signed-in users it links into the funder dashboard with their real figures;
 * for signed-out users the figures show as dashes and clicking it opens the
 * auth flow. While the user / their funding resolves we render a skeleton so
 * the primary CTA below doesn't jump.
 */
export const FundingHeroPanel: FC<FundingHeroPanelProps> = ({ primaryCta }) => {
  const router = useRouter();
  const { user, isLoading: isLoadingUser } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const { executeAuthenticatedAction } = useAuthenticatedAction();
  const { overview, isLoading: isLoadingOverview } = useFundingOverview();

  const fmt = (rsc: number, usd: number) =>
    formatCurrency({
      amount: showUSD ? usd : rsc,
      showUSD,
      exchangeRate,
      shorten: true,
      skipConversion: true,
    });

  const givenRsc = overview?.totalGiven.rsc ?? 0;
  const givenUsd = overview?.totalGiven.usd ?? 0;
  const creditsRsc = user?.lockedBalance ?? 0;
  const creditsUsd = exchangeRate ? creditsRsc * exchangeRate : 0;

  const givenDisplay = user ? fmt(givenRsc, givenUsd) : EMPTY;
  const creditsDisplay = user ? fmt(creditsRsc, creditsUsd) : EMPTY;

  // Reserve the card's space until we know the user (and, for signed-in users,
  // their funding) so the primary CTA below doesn't shift when it resolves.
  const isResolving = isLoadingUser || (Boolean(user) && isLoadingOverview);

  const cardClassName =
    'group flex w-full items-center gap-1 rounded-lg border border-gray-200 bg-white/80 px-1 py-2 text-left shadow-sm transition-colors hover:border-primary-300 hover:bg-primary-50/40';

  const cardInner = (
    <>
      <span className="flex flex-1 items-stretch divide-x divide-gray-200">
        <Stat
          label="You've given"
          value={givenDisplay}
          valueClassName={user ? 'text-primary-600' : 'text-gray-300'}
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
      </span>
      <ChevronRight
        size={18}
        className="mr-0.5 flex-shrink-0 text-gray-400 transition-all group-hover:translate-x-0.5 group-hover:text-primary-600"
      />
    </>
  );

  return (
    <div className="flex w-full flex-col gap-3 sm:w-72">
      {isResolving ? (
        <StatsSkeleton />
      ) : user ? (
        <Link href="/fund/dashboard" aria-label="View dashboard" className={cardClassName}>
          {cardInner}
        </Link>
      ) : (
        <button
          type="button"
          aria-label="Sign in to view your funding"
          onClick={() => executeAuthenticatedAction(() => router.push('/fund/dashboard'))}
          className={cardClassName}
        >
          {cardInner}
        </button>
      )}

      {primaryCta}
    </div>
  );
};

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  valueClassName?: string;
}

const Stat: FC<StatProps> = ({ label, value, valueClassName }) => (
  <span className="flex min-w-0 flex-1 flex-col gap-0.5 px-3">
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

const StatsSkeleton: FC = () => (
  <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white/80 px-1 py-2 shadow-sm">
    <div className="flex flex-1 items-stretch divide-x divide-gray-200">
      {[0, 1].map((i) => (
        <div key={i} className="flex flex-1 flex-col gap-0.5 px-3">
          <div className="h-3 w-20 animate-pulse rounded bg-gray-200" />
          <div className="h-[18px] w-12 animate-pulse rounded bg-gray-200" />
        </div>
      ))}
    </div>
    <div className="mr-0.5 w-[18px] flex-shrink-0" />
  </div>
);
