'use client';

import { ArrowDownToLine, ArrowUpFromLine, HelpCircle, MoreVertical } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { FundingCreditsTooltip } from '@/components/tooltips/FundingCreditsTooltip';
import { formatRSC, formatUsdValue } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';

interface WalletOverviewProps {
  /** Called after a balance-changing action (e.g. withdraw) so the parent can refresh sibling state (transaction feed). */
  onTransactionSuccess?: () => void;
}

interface CurrencyMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const formatUsd = (n: number) => formatUsdValue(n.toString(), 0, false);

export function WalletOverview({ onTransactionSuccess }: WalletOverviewProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const router = useRouter();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();
  const { user, refreshUser } = useUser();
  const rawBalance = user?.balance ?? null;

  const balance = useMemo(
    () => (rawBalance != null && exchangeRate ? formatBalance(rawBalance, exchangeRate) : null),
    [rawBalance, exchangeRate]
  );
  const lockedBalance = useMemo(
    () =>
      user?.lockedBalance && exchangeRate ? formatBalance(user.lockedBalance, exchangeRate) : null,
    [user?.lockedBalance, exchangeRate]
  );

  const isBalanceReady = !isFetchingExchangeRate && rawBalance != null;

  const handleWithdrawSuccess = () => {
    refreshUser({ silent: true });
    onTransactionSuccess?.();
  };

  // Wallet total is just the user's RSC holdings (available + locked / funding
  // credits). DAF balances are no longer surfaced in the wallet.
  const totalRsc = (balance?.raw || 0) + (lockedBalance?.raw || 0);
  const totalUsd = exchangeRate ? totalRsc * exchangeRate : 0;

  const totalPrimary = showUSD ? formatUsd(totalUsd) : `${formatRSC({ amount: totalRsc })} RSC`;
  const totalSecondary = showUSD ? `${formatRSC({ amount: totalRsc })} RSC` : formatUsd(totalUsd);

  const rscMenuItems: CurrencyMenuItem[] = [
    {
      label: 'Deposit',
      icon: <ArrowDownToLine className="h-3.5 w-3.5" />,
      onClick: () => setIsDepositModalOpen(true),
      disabled: !isBalanceReady,
    },
    {
      label: 'Withdraw',
      icon: <ArrowUpFromLine className="h-3.5 w-3.5" />,
      onClick: () => setIsWithdrawModalOpen(true),
      disabled: !isBalanceReady,
    },
  ];

  const fcMenuItems: CurrencyMenuItem[] = [
    {
      label: 'Fund Research',
      icon: <Icon name="fund" size={14} color="#404040" />,
      onClick: () => router.push('/fund'),
    },
  ];

  return (
    <>
      <div className="mb-4 mx-auto w-full">
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {/* Header bar — total balance + primary Deposit CTA */}
          <div className="px-4 sm:px-6 py-5 border-b border-gray-100 flex items-center justify-between gap-4">
            <div className="min-w-0">
              {!isBalanceReady ? (
                <div>
                  <div className="h-9 w-40 bg-gray-100 animate-pulse rounded" />
                  <div className="h-4 w-28 bg-gray-100 animate-pulse rounded mt-2" />
                </div>
              ) : (
                <div>
                  <div className="text-2xl sm:text-[32px] font-bold leading-none text-gray-900">
                    {totalPrimary}
                  </div>
                  <div className="text-sm text-gray-500 mt-1.5">{totalSecondary}</div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsDepositModalOpen(true)}
                variant="default"
                disabled={!isBalanceReady}
              >
                <ArrowDownToLine className="h-4 w-4 mr-1.5" />
                Deposit
              </Button>
              <Button
                onClick={() => setIsWithdrawModalOpen(true)}
                variant="outlined"
                disabled={!isBalanceReady}
              >
                <ArrowUpFromLine className="h-4 w-4 mr-1.5" />
                Withdraw
              </Button>
            </div>
          </div>

          {/* Asset table — fixed columns guarantee alignment across rows */}
          <table className="w-full border-collapse">
            <tbody>
              {/* Row 1 — ResearchCoin */}
              <AssetRow
                icon={
                  <span className="inline-block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                    <ResearchCoinIcon size={32} />
                  </span>
                }
                name="ResearchCoin"
                balance={
                  isBalanceReady ? (
                    <BalanceCell
                      primary={
                        showUSD
                          ? (balance?.formattedUsd ?? '$0.00')
                          : `${balance?.formatted ?? '0'} RSC`
                      }
                      secondary={
                        showUSD
                          ? `${balance?.formatted ?? '0'} RSC`
                          : `${balance?.formattedUsd ?? '$0.00'}`
                      }
                    />
                  ) : (
                    <BalanceSkeleton />
                  )
                }
                trailing={<CurrencyMenu items={rscMenuItems} />}
              />

              {/* Row 2 — Funding Credits */}
              <AssetRow
                icon={
                  <span className="inline-block [&>svg]:w-6 [&>svg]:h-6 sm:[&>svg]:w-8 sm:[&>svg]:h-8">
                    <ResearchCoinIcon size={32} color="#6366f1" outlined />
                  </span>
                }
                name={
                  <span className="inline-flex items-center gap-1.5">
                    Funding Credits
                    <FundingCreditsTooltip>
                      <HelpCircle className="h-[18px] w-[18px] text-gray-500 hover:text-gray-700 cursor-help transition-colors shrink-0" />
                    </FundingCreditsTooltip>
                  </span>
                }
                balance={
                  isBalanceReady ? (
                    <BalanceCell
                      primary={
                        showUSD
                          ? (lockedBalance?.formattedUsd ?? '$0.00')
                          : `${lockedBalance?.formatted ?? '0'} RSC`
                      }
                      secondary={
                        showUSD
                          ? `${lockedBalance?.formatted ?? '0'} RSC`
                          : `${lockedBalance?.formattedUsd ?? '$0.00'}`
                      }
                    />
                  ) : (
                    <BalanceSkeleton />
                  )
                }
                trailing={<CurrencyMenu items={fcMenuItems} />}
                isLast
              />
            </tbody>
          </table>
        </div>
      </div>

      {isBalanceReady && (
        <>
          <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance?.raw || 0}
            onSuccess={handleWithdrawSuccess}
          />
        </>
      )}
    </>
  );
}

interface AssetRowProps {
  icon: React.ReactNode;
  name: React.ReactNode;
  subtext?: React.ReactNode;
  balance: React.ReactNode;
  trailing: React.ReactNode;
  isLast?: boolean;
}

function AssetRow({ icon, name, subtext, balance, trailing, isLast }: AssetRowProps) {
  const borderClass = isLast ? '' : 'border-b border-gray-100';
  return (
    <tr className={borderClass}>
      <td className="pl-4 sm:pl-6 py-4 align-middle w-px whitespace-nowrap">{icon}</td>
      <td className="py-4 pl-3 sm:pl-4 pr-2 align-middle min-w-0">
        <div className="text-xs sm:text-sm font-semibold text-gray-900 leading-tight">{name}</div>
        {subtext && <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{subtext}</div>}
      </td>
      <td className="py-4 px-2 sm:px-4 align-middle text-left whitespace-nowrap w-px sm:min-w-[140px]">
        {balance}
      </td>
      <td className="py-4 pr-4 sm:pr-6 align-middle text-right whitespace-nowrap w-px">
        {trailing}
      </td>
    </tr>
  );
}

function BalanceCell({ primary, secondary }: { primary: string; secondary?: string }) {
  return (
    <div>
      <div className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">{primary}</div>
      {secondary && <div className="text-[11px] sm:text-xs text-gray-500 mt-0.5">{secondary}</div>}
    </div>
  );
}

function BalanceSkeleton() {
  return (
    <div className="inline-block">
      <div className="h-4 w-20 bg-gray-100 animate-pulse rounded" />
      <div className="h-3 w-14 bg-gray-100 animate-pulse rounded mt-1" />
    </div>
  );
}

function CurrencyMenu({ items }: { items: CurrencyMenuItem[] }) {
  return (
    <BaseMenu
      align="end"
      trigger={
        <button
          type="button"
          aria-label="More actions"
          className="h-10 w-10 rounded-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="h-5 w-5" />
        </button>
      }
    >
      {items.map((item) => (
        <BaseMenuItem
          key={item.label}
          onSelect={(e) => {
            if (item.disabled) {
              e.preventDefault();
              return;
            }
            item.onClick();
          }}
          disabled={item.disabled}
          className="cursor-pointer"
        >
          <span className="inline-flex items-center gap-2 text-gray-700">
            {item.icon}
            {item.label}
          </span>
        </BaseMenuItem>
      ))}
    </BaseMenu>
  );
}
