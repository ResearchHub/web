'use client';

import { ArrowDownToLine, ArrowUpFromLine, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useUser } from '@/contexts/UserContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import { Switch } from '@/components/ui/Switch';
import { formatCombinedBalance, formatCombinedBalanceSecondary } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { UserService } from '@/services/user.service';
import { ConfirmModal } from '../modals/ConfirmModal';

interface UserBalanceSectionProps {
  balance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  lockedBalance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  isFetchingExchangeRate: boolean;
  onTransactionSuccess?: () => void;
}

function AssetRowSkeleton() {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div>
          <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-1.5" />
          <div className="h-3 w-16 bg-gray-200 animate-pulse rounded" />
        </div>
      </div>
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-1.5" />
        <div className="h-3 w-14 bg-gray-200 animate-pulse rounded ml-auto" />
      </div>
    </div>
  );
}

export function UserBalanceSection({
  balance,
  lockedBalance,
  isFetchingExchangeRate,
  onTransactionSuccess,
}: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isUpdatingStaking, setIsUpdatingStaking] = useState(false);
  const [isOptOutConfirmOpen, setIsOptOutConfirmOpen] = useState(false);
  const [apy, setApy] = useState<number | null>(null);
  const { user, refreshUser } = useUser();

  useEffect(() => {
    UserService.getStakingYieldDetails()
      .then((data) => setApy(data.apy))
      .catch(() => {});
  }, []);

  const { showUSD } = useCurrencyPreference();

  const handleStakingToggle = async (checked: boolean) => {
    if (!user || isUpdatingStaking) return;
    if (!checked) {
      setIsOptOutConfirmOpen(true);
      return;
    }
    await performStakingUpdate(checked);
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

  const isBalanceReady = !isFetchingExchangeRate;

  return (
    <>
      <div className="mb-6 mx-auto w-full">
        {/* Total Balance */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div>
            <h2 className="text-gray-500 text-sm font-medium mb-3">Balance Overview</h2>
            {!isBalanceReady ? (
              <div>
                <div className="h-10 w-48 bg-gray-100 animate-pulse rounded mb-2" />
                <div className="h-5 w-24 bg-gray-100 animate-pulse rounded" />
              </div>
            ) : (
              <div>
                <div className="text-4xl font-bold text-gray-900">
                  {formatCombinedBalance({ balance, lockedBalance, showUSD })}
                </div>
                <div className="text-gray-500 text-sm mt-1">
                  {formatCombinedBalanceSecondary({ balance, lockedBalance, showUSD })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Asset Rows */}
        <div className="bg-white rounded-xl border border-gray-200 mt-3 px-5">
          {!isBalanceReady ? (
            <>
              <AssetRowSkeleton />
              <div className="border-t border-gray-100" />
              <AssetRowSkeleton />
            </>
          ) : (
            <>
              {/* ResearchCoin */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <ResearchCoinIcon size={32} />
                  <div>
                    <div className="text-sm font-semibold text-gray-900">ResearchCoin</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Tooltip
                    content={user?.isStakingOptedIn ? 'Staking enabled' : 'Enable staking'}
                    position="top"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {apy !== null && !user?.isStakingOptedIn
                          ? `Earn ${Math.round(apy)}%`
                          : 'Earn'}
                      </span>
                      <Switch
                        checked={user?.isStakingOptedIn ?? false}
                        onCheckedChange={handleStakingToggle}
                        disabled={isUpdatingStaking}
                      />
                    </div>
                  </Tooltip>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900 font-mono">
                      {showUSD ? balance?.formattedUsd || '$0.00' : balance?.formatted || '0 RSC'}
                    </div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">
                      {showUSD ? balance?.formatted || '0 RSC' : balance?.formattedUsd || '$0.00'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100" />

              {/* Funding Credits */}
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-3">
                  <ResearchCoinIcon size={32} color="#6366f1" outlined />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-gray-900">Funding Credits</span>
                      <Tooltip content={<FundingCreditsTooltip />} position="top" width="w-fit">
                        <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                      </Tooltip>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900 font-mono">
                    {showUSD
                      ? lockedBalance?.formattedUsd || '$0.00'
                      : lockedBalance?.formatted || '0 RSC'}
                  </div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">
                    {showUSD
                      ? lockedBalance?.formatted || '0 RSC'
                      : lockedBalance?.formattedUsd || '$0.00'}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Button
            onClick={() => setIsDepositModalOpen(true)}
            variant="outlined"
            disabled={!isBalanceReady}
            data-action="deposit"
            className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ArrowDownToLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-900">Deposit</span>
          </Button>
          <Button
            onClick={() => setIsWithdrawModalOpen(true)}
            variant="outlined"
            disabled={!isBalanceReady}
            className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
              <ArrowUpFromLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
            </div>
            <span className="text-sm font-medium text-gray-900">Withdraw</span>
          </Button>
        </div>
      </div>

      {/* Modals */}
      {isBalanceReady && (
        <>
          <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance?.raw || 0}
            onSuccess={onTransactionSuccess}
          />
        </>
      )}
      <ConfirmModal
        isOpen={isOptOutConfirmOpen}
        onClose={() => setIsOptOutConfirmOpen(false)}
        onConfirm={() => performStakingUpdate(false)}
        title="Opt out of staking?"
        message="Are you sure you want to opt out of staking? You will stop earning yield on your ResearchCoin."
        confirmText="Opt Out"
        cancelText="Cancel"
      />
    </>
  );
}
