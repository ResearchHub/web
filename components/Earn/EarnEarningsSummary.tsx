'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sprout, Star } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { UserService, type StakingYieldDetails } from '@/services/user.service';
import { Tooltip } from '@/components/ui/Tooltip';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { formatRSC, formatUsdValue } from '@/utils/number';

// MOCK: the backend does not yet expose lifetime aggregates per earning source,
// so we placeholder Peer Reviews and Fundraises until those endpoints land.
const MOCK_LIFETIME_REVIEW_RSC = 1240;
const MOCK_LIFETIME_FUNDRAISE_RSC = 320;

interface DisplayPair {
  primary: string;
  secondary: string | null;
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

export function EarnEarningsSummary() {
  const { user, isLoading: isUserLoading, refreshUser } = useUser();
  const { exchangeRate, isLoading: isRateLoading } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
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
  const reviewRsc = MOCK_LIFETIME_REVIEW_RSC;
  const fundraiseRsc = MOCK_LIFETIME_FUNDRAISE_RSC;
  const totalRsc = endowmentRsc + reviewRsc + fundraiseRsc;

  const total = useMemo(
    () => formatPair(totalRsc, exchangeRate, showUSD, true),
    [totalRsc, exchangeRate, showUSD]
  );
  const endowment = useMemo(
    () => formatPair(endowmentRsc, exchangeRate, showUSD),
    [endowmentRsc, exchangeRate, showUSD]
  );
  const reviews = useMemo(
    () => formatPair(reviewRsc, exchangeRate, showUSD),
    [reviewRsc, exchangeRate, showUSD]
  );
  const fundraises = useMemo(
    () => formatPair(fundraiseRsc, exchangeRate, showUSD),
    [fundraiseRsc, exchangeRate, showUSD]
  );

  const isReady = !isRateLoading && !isLoadingDetails;

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
                <Icon name="fund" size={18} color="#111827" />
              </span>
            }
            name="Fundraises"
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
