'use client';

import { useEffect, useMemo, useState } from 'react';
import { Sprout } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { RadiatingDot } from '@/components/ui/RadiatingDot';
import { ConfirmModal } from '../modals/ConfirmModal';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { UserService, type StakingYieldDetails } from '@/services/user.service';
import { StakingMultiplierTooltip } from '@/components/tooltips/StakingMultiplierTooltip';
import { getNextTierDetails, formatFundingCreditsAmount } from './lib/stakingUtil';

const EMPTY = '—';

export function StakingOverview() {
  const { user, refreshUser } = useUser();
  const { exchangeRate } = useExchangeRate();
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

  const isOptedIn = user?.isStakingOptedIn ?? false;

  const handleStakingToggle = async (checked: boolean) => {
    if (!user || isUpdatingStaking) return;
    if (!checked) {
      setIsOptOutConfirmOpen(true);
      return;
    }
    await performStakingUpdate(true);
  };

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

  const annualizedYield = details?.apy ?? null;
  const totalYieldEarned = details?.totalYieldEarned ?? null;
  const currentMultiplier = details?.currentMultiplier ?? null;

  const fundingCreditsEarned = useMemo(
    () => formatFundingCreditsAmount(totalYieldEarned, exchangeRate),
    [totalYieldEarned, exchangeRate]
  );
  const fundingCreditsTop = showUSD ? fundingCreditsEarned.usd : fundingCreditsEarned.rsc;
  const fundingCreditsBottom = showUSD
    ? fundingCreditsEarned.rsc
    : fundingCreditsEarned.usd
      ? `≈ ${fundingCreditsEarned.usd}`
      : null;

  const nextTier = useMemo(() => getNextTierDetails(details?.balanceLots), [details]);

  return (
    <>
      <div className="mb-4 mx-auto w-full">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="px-4 sm:px-6 py-4 flex items-start justify-between gap-3 border-b border-gray-100">
            <div className="min-w-0">
              <div className="text-sm sm:text-base font-bold text-gray-900 flex items-center gap-2">
                <Sprout className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
                <span className="sm:hidden">Endowment</span>
                <span className="hidden sm:inline">ResearchHub Endowment</span>
              </div>
              <div className="text-xs text-gray-500 mt-0.5">Earn funding credits</div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <RadiatingDot
                color={isOptedIn ? 'bg-emerald-500' : 'bg-red-500'}
                isRadiating={false}
              />
              <span
                className={`text-xs font-semibold ${isOptedIn ? 'text-gray-900' : 'text-gray-500'}`}
              >
                Earning
              </span>
              <Switch
                checked={isOptedIn}
                onCheckedChange={handleStakingToggle}
                disabled={isUpdatingStaking}
              />
            </div>
          </div>

          {/* Rows */}
          <ul>
            <StatRow
              label="Annualized Yield"
              value={
                annualizedYield != null ? (
                  <span className="text-sm font-bold text-gray-900">
                    {annualizedYield.toFixed(1)}%
                  </span>
                ) : isLoadingDetails ? (
                  <ValueSkeleton />
                ) : (
                  <EmptyValue />
                )
              }
            />
            <StatRow
              label="Funding credits earned"
              value={
                fundingCreditsTop ? (
                  <div className="text-right">
                    <div className="text-sm font-bold text-gray-900">{fundingCreditsTop}</div>
                    {fundingCreditsBottom && (
                      <div className="text-[11px] text-gray-500 mt-0.5">{fundingCreditsBottom}</div>
                    )}
                  </div>
                ) : isLoadingDetails ? (
                  <ValueSkeleton />
                ) : (
                  <EmptyValue />
                )
              }
            />
            <StatRow
              label={
                <span className="inline-flex items-center gap-1.5">
                  Current multiplier
                  <StakingMultiplierTooltip
                    currentMultiplier={currentMultiplier ?? 1}
                    nextMultiplier={nextTier?.projectedMultiplier ?? null}
                    daysUntilNext={nextTier?.daysUntilNext ?? null}
                    progress={nextTier?.progress ?? null}
                  />
                </span>
              }
              value={
                currentMultiplier != null ? (
                  <div className="text-right">
                    <div className="text-sm font-bold text-amber-600">
                      {currentMultiplier.toFixed(2)}×
                    </div>
                    {nextTier && (
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {nextTier.projectedMultiplier.toFixed(2)}× in {nextTier.daysUntilNext}{' '}
                        {nextTier.daysUntilNext === 1 ? 'day' : 'days'}
                      </div>
                    )}
                  </div>
                ) : isLoadingDetails ? (
                  <ValueSkeleton />
                ) : (
                  <EmptyValue />
                )
              }
              isLast
            />
          </ul>
        </div>
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

function StatRow({
  label,
  value,
  isLast,
}: {
  label: React.ReactNode;
  value: React.ReactNode;
  isLast?: boolean;
}) {
  const borderClass = isLast ? '' : 'border-b border-gray-100';
  return (
    <li className={`px-4 sm:px-6 py-3 flex items-center justify-between gap-3 ${borderClass}`}>
      <div className="text-xs sm:text-sm text-gray-700">{label}</div>
      <div className="shrink-0">{value}</div>
    </li>
  );
}

function ValueSkeleton() {
  return <div className="h-4 w-16 bg-gray-100 animate-pulse rounded" />;
}

function EmptyValue() {
  return <span className="text-sm text-gray-400">{EMPTY}</span>;
}
