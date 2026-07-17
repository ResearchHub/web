'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Sprout, Star } from 'lucide-react';
import { FundingIcon } from '@/components/ui/icons/FundingIcon';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useAuthModalContext } from '@/contexts/AuthModalContext';
import { UserService, type StakingYieldDetails } from '@/services/user.service';
import { useEarningOverview } from '@/components/Earn/lib/hooks/useEarningOverview';
import type { EarningAmount } from '@/types/user';
import { Button } from '@/components/ui/Button';
import { Tooltip } from '@/components/ui/Tooltip';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { formatRSC, formatUsdValue, formatLiteralUsd } from '@/utils/number';

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

function formatPair(
  amountRsc: number,
  exchangeRate: number | null,
  showUSD: boolean,
  withPlus = false
): DisplayPair {
  const sign = withPlus && amountRsc > 0 ? '+' : '';
  const rsc = `${sign}${formatRSC({ amount: amountRsc, decimalPlaces: 2 })} RSC`;
  const usd = exchangeRate ? `${sign}${formatUsdValue(amountRsc.toString(), exchangeRate)}` : null;
  if (!usd) return { primary: rsc, secondary: null };
  return showUSD ? { primary: usd, secondary: rsc } : { primary: rsc, secondary: usd };
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
  const { user, isLoading: isUserLoading, refreshUser } = useUser();
  const { exchangeRate, isLoading: isRateLoading } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const { overview, isLoading: isLoadingOverview } = useEarningOverview(user?.id);
  const [details, setDetails] = useState<StakingYieldDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);
  const [isUpdatingStaking, setIsUpdatingStaking] = useState(false);
  const [isOptOutConfirmOpen, setIsOptOutConfirmOpen] = useState(false);

  useEffect(() => {
    UserService.getStakingYieldDetails()
      .then(setDetails)
      .catch(() => setDetails(null))
      .finally(() => setIsLoadingDetails(false));
  }, []);

  const endowmentRsc = details?.totalYieldEarned ?? 0;
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
  const totalRsc = (overview?.totalEarned.rsc ?? 0) + endowmentRsc;
  const totalUsd =
    (overview?.totalEarned.rscUsdSnapshot ?? 0) +
    (overview?.totalEarned.usd ?? 0) +
    (exchangeRate ? endowmentRsc * exchangeRate : 0);

  const total = useMemo(
    () => formatAmountPair(totalRsc, totalUsd, showUSD, true),
    [totalRsc, totalUsd, showUSD]
  );
  const endowment = useMemo(
    () => formatPair(endowmentRsc, exchangeRate, showUSD),
    [endowmentRsc, exchangeRate, showUSD]
  );
  const reviews = useMemo(() => formatEarningPair(reviewAmount, showUSD), [reviewAmount, showUSD]);
  const fundraises = useMemo(
    () => formatEarningPair(fundraiseAmount, showUSD),
    [fundraiseAmount, showUSD]
  );

  const isReady = !isRateLoading && !isLoadingDetails && !isLoadingOverview;

  // Endowment earning status (mirrors the wallet's opt-in behavior).
  const isOptedIn = user?.isStakingOptedIn ?? false;
  const hasNoRsc = !!user && (user.balance ?? 0) <= 0;
  const isEarning = !hasNoRsc && isOptedIn;

  const performStakingUpdate = async (checked: boolean) => {
    setIsUpdatingStaking(true);
    try {
      await UserService.updateStakingOptIn(checked);
      await refreshUser({ silent: true });
    } catch (error) {
      console.error('Failed to update staking preference:', error);
    } finally {
      setIsUpdatingStaking(false);
    }
  };

  const handleToggleEarning = () => {
    if (!user || isUpdatingStaking || hasNoRsc) return;
    if (isEarning) {
      setIsOptOutConfirmOpen(true);
    } else {
      performStakingUpdate(true);
    }
  };

  return (
    <>
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
                <Sprout className="h-[18px] w-[18px] text-gray-900" />
              </span>
            }
            name="From Endowment"
            badge={
              <EarningIndicator
                earning={isEarning}
                hasNoRsc={hasNoRsc}
                loading={isUserLoading || !user}
                onToggle={handleToggleEarning}
              />
            }
            pair={endowment}
            loading={!isReady}
          />
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

      <ConfirmModal
        isOpen={isOptOutConfirmOpen}
        onClose={() => setIsOptOutConfirmOpen(false)}
        onConfirm={() => performStakingUpdate(false)}
        title="Turn off earnings?"
        message="You will no longer earn funding credits on your ResearchCoin balance."
        confirmText="Turn off"
        cancelText="Cancel"
      />
    </>
  );
}

// Logged-out teaser: mirrors the summary card chrome but reframes it as a
// preview that nudges visitors to create an account before they can earn.
const TEASER_SOURCES = [
  {
    name: 'From Endowment',
    icon: <Sprout className="h-[18px] w-[18px] text-gray-900" />,
    amountRsc: 980,
  },
  {
    name: 'Peer Reviews',
    icon: <Star className="h-[18px] w-[18px] text-gray-900" />,
    amountRsc: 1240,
  },
  {
    name: 'Funded proposals',
    icon: <FundingIcon size={18} color="#111827" />,
    amountRsc: 320,
  },
];

export function EarnEarningsSummaryTeaser() {
  const { exchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const { showAuthModal } = useAuthModalContext();

  return (
    <div className="relative bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header — reframed as an invitation rather than a balance */}
      <div className="px-4 sm:px-6 py-5 border-b border-gray-100">
        <div className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
          Earn ResearchCoin
        </div>
        <h2 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
          Start earning ResearchCoin
        </h2>
        <p className="mt-1 text-sm text-gray-600 max-w-md">
          Hold for daily yield, get paid for peer reviews, and raise money for your research.
        </p>
      </div>

      {/* First source revealed so the section reads clearly... */}
      <ul>
        <EarnSourceRow
          icon={
            <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
              {TEASER_SOURCES[0].icon}
            </span>
          }
          name={TEASER_SOURCES[0].name}
          pair={formatPair(TEASER_SOURCES[0].amountRsc, exchangeRate, showUSD)}
        />
      </ul>

      {/* ...then the remaining sources fade out progressively behind the CTA */}
      <div className="relative">
        <ul aria-hidden="true" className="select-none pointer-events-none">
          {TEASER_SOURCES.slice(1).map((source, index) => (
            <li
              key={source.name}
              style={{ filter: `blur(${(index + 1) * 2.5}px)`, opacity: 0.7 - index * 0.2 }}
            >
              <EarnSourceRow
                icon={
                  <span className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-100">
                    {source.icon}
                  </span>
                }
                name={source.name}
                pair={formatPair(source.amountRsc, exchangeRate, showUSD)}
                isLast={index === TEASER_SOURCES.length - 2}
              />
            </li>
          ))}
        </ul>

        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-b from-white/10 via-white/70 to-white/95 px-4 text-center">
          <Button variant="default" onClick={() => showAuthModal()} className="shadow-sm">
            Create an account
            <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
          <p className="text-xs text-gray-500">Join thousands of researchers on ResearchHub</p>
        </div>
      </div>
    </div>
  );
}

interface EarnSourceRowProps {
  icon: React.ReactNode;
  name: string;
  badge?: React.ReactNode;
  pair: DisplayPair;
  loading?: boolean;
  isLast?: boolean;
}

function EarnSourceRow({ icon, name, badge, pair, loading, isLast }: EarnSourceRowProps) {
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
          {badge}
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

interface EarningIndicatorProps {
  earning: boolean;
  hasNoRsc: boolean;
  loading?: boolean;
  onToggle: () => void;
}

function EarningIndicator({ earning, hasNoRsc, loading, onToggle }: EarningIndicatorProps) {
  if (loading) {
    return <span className="inline-block h-5 w-20 bg-gray-100 rounded-full animate-pulse" />;
  }

  const pill = (
    <button
      type="button"
      onClick={onToggle}
      disabled={hasNoRsc}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold transition-colors',
        earning
          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
          : 'bg-gray-100 text-gray-500 hover:bg-gray-200',
        hasNoRsc && 'cursor-default hover:bg-gray-100'
      )}
    >
      {earning ? (
        <RadiatingDot ring color="bg-emerald-500" size="sm" />
      ) : (
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
      )}
      {earning ? 'Earning' : 'Not earning'}
    </button>
  );

  if (hasNoRsc) {
    return (
      <Tooltip
        content={
          <div className="text-left">
            <div className="text-sm font-bold text-white mb-1">Endowment off</div>
            <p className="text-xs text-gray-300 leading-snug">
              Deposit ResearchCoin to start earning funding credits.
            </p>
          </div>
        }
        position="top"
        width="w-60"
        className="bg-gray-900 text-white border-gray-900 text-left"
        disableTouchClick
      >
        {pill}
      </Tooltip>
    );
  }

  return pill;
}
