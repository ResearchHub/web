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
        {/* Consolidated ResearchCoin card */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header: identity + earning control + total balance */}
          <div className="p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <ResearchCoinIcon size={32} />
                <span className="text-sm font-semibold text-gray-900">ResearchCoin</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      user?.isStakingOptedIn ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.isStakingOptedIn
                      ? apy !== null
                        ? `Earning ${Math.round(apy)}%`
                        : 'Earning'
                      : 'Not earning'}
                  </span>
                </div>
                <Switch
                  checked={user?.isStakingOptedIn ?? false}
                  onCheckedChange={handleStakingToggle}
                  disabled={isUpdatingStaking || !isBalanceReady}
                />
              </div>
            </div>
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

          {/* Funding Credits sub-row (iconless, balance-only) */}
          <div className="border-t border-gray-100 px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-0">
              <ResearchCoinIcon size={20} color="#6366f1" outlined />
              <span className="text-sm font-medium text-gray-700">Funding Credits</span>
              <Tooltip content={<FundingCreditsTooltip />} position="top" width="w-fit">
                <HelpCircle className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              </Tooltip>
            </div>
            {!isBalanceReady ? (
              <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
            ) : (
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900 font-mono">
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
            )}
          </div>
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
        title="Turn off earnings?"
        message="You will no longer earn funding credits on your ResearchCoin balance."
        confirmText="Turn off"
        cancelText="Cancel"
      />
    </>
  );
}
